import { UserButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";
import Breadcrumb from './Breadcrumb';

const Navbar = async () => {
  const user = await currentUser();
  return (
    <div className="flex items-center justify-between p-4 bg-[#F4F4F7]">
      {/* Breadcrumb navigation */}
      <div className="flex-1">
        <Breadcrumb />
      </div>

      {/* User profile information */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-sm leading-3 font-medium">John Doe</span>
          <span className="text-[12px] text-gray-500 text-right capitalize">{user?.publicMetadata.role as string}</span>
        </div>
        <UserButton/>
      </div>
    </div>
  )
}

export default Navbar