import { UserButton } from '@clerk/nextjs';
import { currentUser } from "@clerk/nextjs/server";
import Breadcrumb from './Breadcrumb';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = async () => {
  const user = await currentUser();
  const username = user?.username||"";
  const firstName= user?.firstName||"";
  const lastName= user?.lastName||"";
  return (
    <div className="flex items-center justify-between p-4 bg-[#F4F4F7] dark:bg-dark-bg-secondary">
      {/* Breadcrumb navigation */}
      <div className="flex-1">
        <Breadcrumb />
      </div>

      {/* User profile information */}
      <div className="flex items-center gap-6">
        <ThemeSwitcher />
        <div className="flex flex-col">
          <span className="text-sm leading-3 font-medium dark:text-dark-text">{firstName.length>0?(firstName+" "+lastName):(username)}</span>
          <span className="text-[12px] text-gray-500 dark:text-dark-text-muted text-right capitalize">{user?.publicMetadata.role as string}</span>
        </div>
        <UserButton/>
      </div>
    </div>
  )
}

export default Navbar