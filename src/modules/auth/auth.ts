import "server-only";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { db } from "@/server/db";
import { getEnv } from "@/config/env";
import { appConfig } from "@/config/app";
import { emailReady, sendEmail } from "@/modules/email/service";
let instance: ReturnType<typeof createAuth> | undefined;
function createAuth() {
  const env = getEnv();
  return betterAuth({
    appName: appConfig.name,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(db, { provider: "postgresql" }),
    trustedOrigins: [env.BETTER_AUTH_URL],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (
          ["/sign-up/email", "/update-user"].includes(ctx.path) &&
          ctx.body?.name !== undefined
        ) {
          if (
            typeof ctx.body.name !== "string" ||
            ctx.body.name.trim().length < 2 ||
            ctx.body.name.length > 100
          )
            throw new APIError("BAD_REQUEST", {
              message: "Name must be 2–100 characters",
            });
          ctx.body.name = ctx.body.name.trim();
        }
      }),
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: emailReady(),
      sendResetPassword: async ({ user, url }) =>
        sendEmail(
          user.email,
          "Reset your password",
          "Use this link to reset your password.",
          url,
        ),
    },
    emailVerification: {
      sendOnSignUp: emailReady(),
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) =>
        sendEmail(
          user.email,
          "Verify your email",
          "Confirm your email address.",
          url,
        ),
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          const [owned, subscription, files] = await Promise.all([
            db.member.findFirst({
              where: { userId: user.id, role: { contains: "owner" } },
            }),
            db.subscription.findUnique({ where: { userId: user.id } }),
            db.storedFile.count({ where: { userId: user.id } }),
          ]);
          if (owned)
            throw new APIError("BAD_REQUEST", {
              message:
                "Transfer or delete owned workspaces before deleting your account",
            });
          if (
            subscription &&
            ["active", "trialing", "past_due"].includes(subscription.status)
          )
            throw new APIError("BAD_REQUEST", {
              message:
                "Cancel your provider subscription before deleting your account",
            });
          if (files)
            throw new APIError("BAD_REQUEST", {
              message:
                "Delete your uploaded files before deleting your account",
            });
        },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    socialProviders: {
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: env.GITHUB_CLIENT_ID,
              clientSecret: env.GITHUB_CLIENT_SECRET,
            },
          }
        : {}),
    },
    plugins: appConfig.features.organizations
      ? [
          organization({
            sendInvitationEmail: async (data) =>
              sendEmail(
                data.email,
                "Workspace invitation",
                `${data.inviter.user.name} invited you to ${data.organization.name} as ${data.role}.`,
                `${env.BETTER_AUTH_URL}/invite/${data.id}`,
              ),
          }),
        ]
      : [],
  });
}
export function getAuth() {
  return (instance ??= createAuth());
}
