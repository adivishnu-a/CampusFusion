"use client";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";

const data = [
  {
    name: "Mon",
    present: 60,
    absent: 40,
  },
  {
    name: "Tue",
    present: 70,
    absent: 30,
  },
  {
    name: "Wed",
    present: 50,
    absent: 50,
  },
  {
    name: "Thu",
    present: 40,
    absent: 60,
  },
  {
    name: "Fri",
    present: 60,
    absent: 40,
  },
  {
    name: "Sat",
    present: 70,
    absent: 30,
  },
];
const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#7E99A3" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#7E99A3" }}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#7E99A3" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
            cursor={{ fill: 'transparent' }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar  
            dataKey="present"
            fill="#0183ff"
            legendType="circle"
            radius={[5, 5, 0, 0]}
            activeBar={<Rectangle stroke="#1F2431" strokeWidth={0.8} />}
          />
          <Bar
            dataKey="absent"
            fill="#8ea3bf"
            legendType="circle"
            radius={[5, 5, 0, 0]}
            activeBar={<Rectangle stroke="#1F2431" strokeWidth={0.8} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
