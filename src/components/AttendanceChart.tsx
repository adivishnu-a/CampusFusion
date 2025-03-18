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
// import Image from "next/image";

const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={500} height={300} data={data} barSize={20}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#7E99A3"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: "#7E99A3" }}
          tickLine={false}
        />
        <YAxis tick={{ fill: "#7E99A3" }} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          cursor={{ fill: "transparent" }}
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
  );
};

export default AttendanceChart;
