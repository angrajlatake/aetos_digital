import React from "react";
import MenuOptions from "./MenuOptions";
import { getAuthUserDetails } from "@/lib/queries";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) {
    return null;
  }
  if (!user.Agency) return;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccount.find((subAccount) => subAccount.id === id);

  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  let sidebarLogo = user.Agency.agencyLogo || "/public/assets/logo_dark.png";

  if (isWhiteLabeledAgency) {
    if (type === "subaccount") {
      sidebarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sideBarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subAccount) => subAccount.id === id)
          ?.SidebarOption || [];

  const subAccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        id={id}
        details={details}
        sidebarLogo={sidebarLogo}
        sideBarOpt={sideBarOpt}
        subAccounts={subAccounts}
        user={user}
      />
    </>
  );
};

export default Sidebar;
