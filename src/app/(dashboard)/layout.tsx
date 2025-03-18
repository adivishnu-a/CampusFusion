import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Menu from "../../components/Menu";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] h-screen flex flex-col">
        <div className="p-4">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <span className="hidden lg:block font-bold">CampusFusion</span>
          </Link>
        </div>
        <div className="flex-1 overflow-scroll sidebar p-4 pt-0">
          <Menu />
        </div>
      </div>
      {/* Right */}
      <div className="h-screen w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F4F4F7] flex flex-col">
        {/* Fixed Navbar */}
        <div className="sticky top-0 bg-[#F4F4F7] z-10">
          <Navbar />
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
