import React from "react";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/global/mode-toggle";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }) => {
  return (
    <div className="p-4 flex justify-between relative">
      <aside className="flex items-center gap-2">
        <Image
          className="transition-all dark:hidden"
          src="/assets/logo_light.png"
          alt="logo"
          width={40}
          height={40}
        />
        <Image
          src="/assets/logo_dark.png"
          className="hidden  transition-all dark:block"
          alt="logo"
          width={40}
          height={40}
        />
        <span className="text-2xl font-bold">Aetos.</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          {/* TODO: Add links */}
          <Link href={"#"}>Pricing</Link>
          <Link href={"#"}>About</Link>
          <Link href={"#"}>Documentation</Link>
          <Link href={"#"}>Features</Link>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link href={"/agency"} className={buttonVariants()}>
          Login
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
};

export default Navigation;
