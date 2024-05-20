import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Props } from "./menu-options";

export const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sideBarOpt,
  sidebarLogo,
  details,
  user,
  id,
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="absolute left-4 z-[100] md:!hidden flex">
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent></SheetContent>
    </Sheet>
  );
};
