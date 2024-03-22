"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { zodResolver } from "@hookform/resolvers/zod";
import { Agency } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { deleteAgency, initUser, upsertAgency } from "@/lib/queries";

type Props = {
  data?: Partial<Agency>;
};

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  companyEmail: z.string().email("Invalid email address"),
  companyPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip must be at least 5 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  // agencyLogo: z.string().url("Invalid URL"),
  whiteLabel: z.boolean().default(false),
});

const AgencyDetails = ({ data }: Props) => {
  const [deletingAgency, setDeletingAgency] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: data?.name || "",
      companyEmail: data?.companyEmail || "",
      companyPhone: data?.companyPhone || "",
      whiteLabel: data?.whiteLabel || false,
      address: data?.address || "",
      city: data?.city || "",
      zipCode: data?.zipCode || "",
      state: data?.state || "",
      country: data?.country || "",
      // agencyLogo: data?.agencyLogo || "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const newUserData = await initUser({ role: "AGNECY_OWNER" });
      if (!data?.customerId) {
        const response = await upsertAgency({
          id: data?.id ? data.id : v4(),
          customerId: v4(),
          address: values.address,
          agencyLogo: values.agencyLogo,
          city: values.city,
          companyPhone: values.companyPhone,
          country: values.country,
          name: values.name,
          state: values.state,
          whiteLabel: values.whitelabel,
          zipCode: values.zipCode,
          createdAt: new Date(),
          updatedAt: new Date(),
          companyEmail: values.companyEmail,
          connectAccountId: "",
          goal: 5,
        });
      }
      toast({
        title: "Agency created",
        description: "Your agency has been created",
      });
      router.refresh();
    } catch {}
  };
  const handleDeleteAgency = async () => {
    if (!data?.id) return;
    setDeletingAgency(true);
    // TODO: discontinue subscription
    try {
      const response = await deleteAgency(data.id);
      toast({
        title: "Agency deleted",
        description: "Your agency and all subaccounts has been deleted",
      });
      router.refresh();
    } catch {
      console.error("Failed to delete agency");
      toast({
        variant: "destructive",
        title: "Opps!",
        description: "Could not delete agency. Please try again.",
      });
    }
    setDeletingAgency(false);
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Let's create an agency for your business. You can edit agency
            settings later from the agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* <FormField
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}
              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your Agency name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your Agency Email" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Phone" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whiteLabel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                    <div>
                      <FormLabel>Whitelavel Agency</FormLabel>
                      <FormDescription>
                        Whitelabel mode will help you show your brand to all sub
                        accounts by default. You can overwrite this in the sub
                        account settings.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 st..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="State" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Zipcode" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Save Agency Information</Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Danger Zone</div>
              </div>
              <div className="text-mited-foreground">
                Deleting Agency is an irreversible step. This will also delete
                all subaccounts and all data related to your subaccounts. Sub
                account will not longer have access to funnels, contacts etc.
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingAgency}
                className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingAgency ? "Deleting..." : "Delete Agency"}
              </AlertDialogTrigger>
            </div>
          )}

          <AlertDialogContent>
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle>
                Are you sure you want to delete this agency?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This step can not be undone. This will permenantly delete all
                the Agency account and all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="hover:bg-destructive transition-all duration-200 hover:text-white  rounded-md mb-2"
                onClick={handleDeleteAgency}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
