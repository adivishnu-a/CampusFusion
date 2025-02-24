"use client";
import Image from "next/image";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Boys",
    value: 55,
    fill: "#0183ff",
  },
  {
    name: "Girls",
    value: 45,
    fill: "#Fc6a6b",
  },
];

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* Chart */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              dataKey="value"
              startAngle={-270}
              endAngle={90}
              paddingAngle={2}
              animationBegin={0}
              animationDuration={1200}
            />
          </PieChart>
        </ResponsiveContainer>
        <Image src="/maleFemale.png" alt="" width={50} height={50} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* Bottom */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
            <div className="w-5 h-5 bg-campDarwinCobaltBlue rounded-full" />
            <h1 className="font-bold">1,234</h1>
            <h2 className="text-xs text-gray-500">Boys (55%)</h2>
        </div>
        <div className="flex flex-col gap-1">
            <div className="w-5 h-5 bg-campDarwinCandyPeach rounded-full" />
            <h1 className="font-bold">1,234</h1>
            <h2 className="text-xs text-gray-500">Girls (45%)</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
