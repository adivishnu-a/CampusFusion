import UserCard from "../../../components/UserCard";
import AttendanceChart from "../../../components/AttendanceChart";
import FinanceChart from "@/components/FinanceChart";
import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";
import CountChartContainer from "@/components/CountChartContainer";
const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {/* User Cards */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin"></UserCard>
          <UserCard type="student"></UserCard>
          <UserCard type="teacher"></UserCard>
          <UserCard type="parent"></UserCard>
        </div>
        {/* Middle Charts */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Count Chart */}
          <div className="w-full lg:w-1/3 h-[450px] bg-white rounded-xl shadow-sm p-4">
            <CountChartContainer />
          </div>
          {/* Attendance Chart */}
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-xl shadow-sm p-4">
            <AttendanceChart />
          </div>
        </div>
        {/* Bottom Chart */}
        <div className="w-full h-[500px] bg-white rounded-xl shadow-sm p-4">
          <FinanceChart />
        </div>
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
