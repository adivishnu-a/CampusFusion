"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-campDarwinPastelBlue">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold flex items-center gap-2 text-campDarwinCobaltBlue">
            <Image src="/logo.png" alt="" width={48} height={48} />
            CampusFusion
          </h1>
          <h2 className="text-lg text-campDarwinSignalBlue">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-500" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-md text-campDarwinSignalBlue">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-lg ring-1 ring-gray-400"
            />
            <Clerk.FieldError className="text-sm text-red-500" />
          </Clerk.Field>
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-md text-campDarwinSignalBlue">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-lg ring-1 ring-gray-400"
            />
            <Clerk.FieldError className="text-sm text-red-500" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-campDarwinCobaltBlue text-white my-1 rounded-lg text-md p-[10px]"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;