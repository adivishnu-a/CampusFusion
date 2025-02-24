import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Menu from "../../components/Menu";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 h-screen overflow-scroll">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">CampusFusion</span>
        </Link>
        <Menu />
      </div>
      {/* Right */}
      <div className="h-screen w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F4F4F7] overflow-scroll">
        {/* Navbar has to be  */}
        <Navbar />
        {children}
      </div>
    </div>
  );
}
