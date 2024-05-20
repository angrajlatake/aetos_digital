import Sidebar from "@/components/sidebar";
import UnAuthAccess from "@/components/unauthorized";
import {
  getNotificationsAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { get } from "http";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: { agencyid: string };
};

const layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    return redirect("/");
  }

  if (!agencyId) {
    return redirect("/agnecy");
  }

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    return <UnAuthAccess />;
  }
  let allNotifications: any = [];
  const notifications = await getNotificationsAndUser(agencyId);
  if (notifications) {
    allNotifications = notifications;
  }
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={agencyId} type="agency" />
      <div className="md:pl-[300px]">{children}</div>
    </div>
  );
};

export default layout;
