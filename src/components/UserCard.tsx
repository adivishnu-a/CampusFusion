import Image from "next/image";
const UserCard = ({ type }: { type: string }) => {
  return (
    <div className="rounded-2xl odd:bg-campDarwinCobaltBlue even:bg-campDarwinSignalBlue p-4 flex-1">
      <div className="flex justify-between items-center gap-1">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-800">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={18} height={18} />
      </div>
      <h1 className="text-2xl font-semibold my-4 text-white">1,234</h1>
      {/* If the type is Parent, then the h2 should be visible as Parent Logins*/}
      {type === "parent" && (
        <h2 className="capitalize text-sm font-medium text-white">{type} Accounts</h2>
      )}
      {/* If the type is Staff, then the h2 should be visible as Staff Logins*/}
      {type === "staff" && (
        <h2 className="capitalize text-sm font-medium text-white">{type}</h2>
      )}
      {/* Else it should be visible normally */}
      {type !== "parent" && type !== "staff" && (
        <h2 className="capitalize text-sm font-medium text-white">{type}s</h2>
      )}
    </div>
  );
};

export default UserCard;
