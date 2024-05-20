'use server'

import { clerkClient, currentUser } from "@clerk/nextjs";
import { db } from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, User } from "@prisma/client";

export const createTeamUser = async(agencyId:string, user:User)=>{
    if (user.role === "AGENCY_OWNER") return null
    const response = await db.user.create({
        data:{...user}
    })
    return response;
}

export const saveActivityLogsNotification = async({agencyId, description, subaccountId}:{agencyId:string, description:string, subaccountId:string})=>{
    const authUser = await currentUser();
    let userData;
    if (!authUser) {
        const response = await db.user.findFirst({
            where:{
                Agency:{
                    SubAccount:{
                        some:{
                            id: subaccountId
                        }
                    }
                }
            }
        })
        if (response) {
            userData = response
        }
    }
    else{
        userData = await db.user.findUnique({
            where:{
                email: authUser.emailAddresses[0].emailAddress
            }
        })
    }
    if (!userData) {
        console.log("User not found")
        return
    }

    let foundAgencyId = agencyId
    if (!foundAgencyId){
        if (!subaccountId) {
            throw new Error("AgencyId or SubaccountId is required")
        }
        const response = await db.subAccount.findUnique({
            where:{
                id: subaccountId
            }
        })
    }
    if(subaccountId){
        await db.notification.create({
            data:{
                notification: `${userData.name} ${description}`,
                User:{
                    connect:{
                        id: userData.id
                    }
                },
                Agency:{
                    connect:{
                        id: foundAgencyId
                    }
                },
                SubAccount:{
                    connect:{
                        id: subaccountId
                    }
                }

            }
        })
    } else{
        await db.notification.create({
            data:{
                notification: `${userData.name} ${description}`,
                User:{
                    connect:{
                        id:userData.id
                    }
                },
                Agency:{
                    connect:{
                        id: foundAgencyId
                    }
                }
            }
        })
    }
}

export const getAuthUserDetails = async () => {
    const user = await currentUser();
    if (!user) {
        return;
    }

    const userDetails = await db.user.findUnique({
        where:{
            email: user.emailAddresses[0].emailAddress
        },
        include:{
            Agency:{
                include:{
                    SidebarOption: true,
                    SubAccount:{
                        include:{
                            SidebarOption: true
                        }
                    }
                }
            },
            Permissions: true
        }
    })
    return userDetails;
}
export const verifyAndAcceptInvitation = async()=>{
    const user = await currentUser();
    if (!user) {
        return redirect("/sign-in");
    }
    const inviationExists = await db.invitation.findUnique({
        where:{
            email: user.emailAddresses[0].emailAddress,
            status: "PENDING"
        }
    })
    if(inviationExists){
        const userDetails = await createTeamUser(inviationExists.agencyId, {
            email: inviationExists.email,
            agencyId: inviationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: inviationExists.role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        await saveActivityLogsNotification({agencyId: inviationExists?.agencyId, description:"Joined", subaccountId: undefined})
        if (userDetails){
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata:{
                    role: userDetails.role || "SUBACCOUNT_USER",
                }
            })
            await db.invitation.delete({
                where:{
                    email: userDetails.email
                }
            })
            return userDetails.agencyId
        } else return null
    } else {
        const agency = await db.user.findUnique({
            where:{
                email: user.emailAddresses[0].emailAddress

            }
        })
        return agency ? agency.agencyId : null
    }
}

export const deleteAgency = async(agencyId:string)=>{
    const response = await db.agency.delete({
        where:{
            id: agencyId
        }
    })
    return response;
}

export const initUser = async (newUser: Partial<User>)=>{
    const user = await currentUser();
    if (!user) return
    const userData = await db.user.upsert({
        where:{
            email: user.emailAddresses[0].emailAddress
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || "SUBACCOUNT_USER",
        }
    })
    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata:{
            role: userData.role || "SUBACCOUNT_USER",
        }
    })
    return userData;
}

export const upsertAgency = async (agency:Agency, price?: Plan)=>{
    if (!agency.companyEmail) return null
    try{
        const agencyDetails = await db.agency.upsert({
            where:{
                id: agency.id
            },
            update: agency,
            create:{
                users:{
                    connect:{
                        email: agency.companyEmail
                    },
                },
                ...agency,
                SidebarOption:{
                    create:[
                        {
                          name: 'Dashboard',
                          icon: 'category',
                          link: `/agency/${agency.id}`,
                        },
                        {
                          name: 'Launchpad',
                          icon: 'clipboardIcon',
                          link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                          name: 'Billing',
                          icon: 'payment',
                          link: `/agency/${agency.id}/billing`,
                        },
                        {
                          name: 'Settings',
                          icon: 'settings',
                          link: `/agency/${agency.id}/settings`,
                        },
                        {
                          name: 'Sub Accounts',
                          icon: 'person',
                          link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                          name: 'Team',
                          icon: 'shield',
                          link: `/agency/${agency.id}/team`,
                        },
                      ],
                }
            }
        })
        return agencyDetails;
        
    }
    catch(e){
        console.log(e)
    }
}

export const getNotificationsAndUser = async(agencyId:string)=>{
    try {
        const reponse = await db.notification.findMany(
            {
                where:{agencyId},
                include:{
                    User: true
                },
                orderBy:{
                    createdAt: "desc"
                },
            }
        )
        return reponse;
    } catch (error) {
        console.log(error)
    }

}