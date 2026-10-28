import { notFound } from "next/navigation";
import { appConfig } from "@/config/app";
import { NotificationList } from "@/components/shared/notification-list";
export default function Page() {
  if (!appConfig.features.notifications) notFound();
  return (
    <>
      <h1 className="mb-8 text-3xl">Notifications</h1>
      <NotificationList />
    </>
  );
}
