import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";

const UnAuthAccess = () => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center gap-2 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">
          Unauthorized Access
        </h1>
        <p className="text-grey-500 leading-loose">
          Please contact support or your Agency owner to get access
        </p>
      </div>
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  );
};

export default UnAuthAccess;
