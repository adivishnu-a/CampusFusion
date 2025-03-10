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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-8 rounded-lg shadow-md w-96"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-4">
              <Image
                src="/logo.png"
                alt="CampusFusion Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-campDarwinCobaltBlue to-campDarwinMixedBlue bg-clip-text text-transparent">
              CampusFusion
            </h1>
            <p className="text-gray-500 mt-2 text-center">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <Clerk.GlobalError className="text-sm text-red-500" />
            <Clerk.Field name="identifier" className="flex flex-col">
              <Clerk.Label className="block text-sm text-gray-600">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
              <Clerk.FieldError className="text-sm text-red-500" />
            </Clerk.Field>
            <Clerk.Field name="password" className="flex flex-col">
              <Clerk.Label className="block text-sm text-gray-600">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
              <Clerk.FieldError className="text-sm text-red-500" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="w-full bg-campDarwinCobaltBlue text-white p-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              Sign In
            </SignIn.Action>
          </div>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;