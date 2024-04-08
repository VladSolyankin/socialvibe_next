"use client";

import { SignUpForm } from "@/components/shared/SignUpForm";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import LogoPicture from "../../../public/socialvibe_logo.png";
import HeroPicture from "../../../public/signin_hero.avif";

export default function SignUp() {
  return (
    <div className="flex h-screen w-screen items-center justify-center max-[1300px]:flex-col overflow-x-hidden">
      <div className="flex laptop:flex-row laptop:flex-col h-[80%] w-[80%] border-2 border-gray-600 rounded-2xl">
        <div className="w-[50%] relative p-5">
          <Image
            src={LogoPicture}
            className="absolute pt-4"
            alt="SocialVibe Logo"
          />
          <Image
            alt="Hero Image"
            className="h-full w-full object-fit rounded-xl"
            src={HeroPicture}
          />
        </div>
        <SignUpForm />
      </div>
      <Toaster />
    </div>
  );
}
