import "server-only";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

import { getEnv } from "@/config/env";
export function emailReady() {
  return !!process.env.SMTP_HOST;
}
export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  url?: string,
) {
  const env = getEnv();
  if (!env.SMTP_HOST)
    throw new Error(
      "Email requires SMTP_HOST. Start Mailpit or configure SMTP.",
    );
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } }
      : {}),
  });
  const html = await render(
    <html>
      <body>
        <main>
          <h1>{subject}</h1>
          <p>{message}</p>
          {url && <a href={url}>Continue securely</a>}
        </main>
      </body>
    </html>,
  );
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text: message + (url ? "\n" + url : ""),
  });
}
