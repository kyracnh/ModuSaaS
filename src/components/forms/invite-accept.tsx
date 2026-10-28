"use client";
import { authClient } from "@/modules/auth/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export function InviteAccept({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        const r = await authClient.organization.acceptInvitation({
          invitationId: id,
        });
        if (r.error) toast.error(r.error.message);
        else router.push("/dashboard/workspace");
      }}
    >
      Accept invitation
    </Button>
  );
}
