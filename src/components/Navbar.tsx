import { UserButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";
import Image from 'next/image';
const Navbar = async () => {
  const user = await currentUser();
  return (
    <div className="flex items-center justify-between p-4 bg-[#F4F4F7]">
      {/* Icons and User */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="flex flex-col">
          <span className="text-sm leading-3 font-medium">John Doe</span>
          <span className="text-[12px] text-gray-500 text-right capitalize">{user?.publicMetadata.role as string}</span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButton/>
      </div>
    </div>
  )
}

export default Navbar