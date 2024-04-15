"use client";

import { SignInForm } from "@/components/shared/SignInForm";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import LogoPicture from "../../../public/socialvibe_logo.png";
import HeroPicture from "../../../public/signin_hero.avif";

export default function SignIn() {
  return (
    <div className="flex h-screen w-screen items-center justify-center max-[1300px]:flex-col overflow-x-hidden">
      <div className="flex laptop:flex-row laptop:flex-col h-[80%] w-[80%] border-2 border-gray-600 rounded-2xl">
        <div className="w-[50%] relative p-5 basis-1/2">
          <Image
            src={LogoPicture}
            alt="SocialVibe Logo"
            className="absolute pt-4"
          />
          <Image
            className="h-full w-full object-fit rounded-xl"
            alt="Hero Image"
            src={HeroPicture}
          />
        </div>
        <SignInForm />
      </div>
      <Toaster />
    </div>
  );
}
