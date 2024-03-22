"use client";
import { useEffect, useState } from "react";
import { countries } from "countries-list";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 } from "uuid";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
import { Input } from "@/components/ui/input";
import { Agency } from "@prisma/client";
import { Switch } from "../ui/switch";
import FileUpload from "../global/file-upload";
import Loading from "../global/loading";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { initUser, upsertAgency } from "@/lib/queries";

type Props = {
  data?: Partial<Agency>;
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 3 characters"),
  companyEmail: z.string().email("Invalid email address"),
  companyPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  whiteLabel: z.boolean().default(false),
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 3 characters"),
  agencyLogo: z.string().url("Invalid URL"),
});

export function ProfileForm({ data }: Props) {
  const [deletingAgency, setDeletingAgency] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [popOverOpen, setPopOverOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
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
      agencyLogo: data?.agencyLogo || "",
    },
  });
  const { formState } = form;
  const countryList = Object.entries(countries).map(([code, country]) => ({
    code,
    ...country,
  }));

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const newUserData = await initUser({ role: "AGENCY_OWNER" });
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
          whiteLabel: values.whiteLabel,
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
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <FormField
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
              />
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
              </div>
              <div className="flex md:flex-row gap-4">
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
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Country</FormLabel>
                      <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? countryList.find(
                                    (country) => country.name === field.value
                                  )?.name
                                : "Select country"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countryList.map((country) => (
                                <CommandItem
                                  value={country.name}
                                  key={country.name}
                                  onSelect={() => {
                                    form.setValue("country", country.name);
                                    setPopOverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">
                {formState.isSubmitting ? (
                  <Loading />
                ) : (
                  "Save Agency Information"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}
