import AgencyDetails from "@/components/forms/agencydetails";
import { ProfileForm } from "@/components/forms/testForm";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  console.log(agencyId);
  const user = await getAuthUserDetails();
  if (agencyId) {
    if (user?.role === "SUBACCOUNT_USER" || user?.role === "SUBACCOUNT_GUEST") {
      return redirect("/subaccount");
    } else if (user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") {
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plan}`
        );
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];
        if (!stateAgencyId) return <div>Not Authorized</div>;
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`
        );
      } else return redirect(`/agency/${agencyId}`);
    } else {
      return <div>Not Authorized</div>;
    }
  }
  const authUser = await currentUser();
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="p-4 max-w-[850px] border-[1px] rounded-xl">
        <h1>Create an agency</h1>
        {/* <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        /> */}
        <ProfileForm
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  );
};

export default Page;
