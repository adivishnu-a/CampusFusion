"use client";
import Image from "next/image";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Boys",
      value: boys,
      fill: "#0183ff",
    },
    {
      name: "Girls",
      value: girls,
      fill: "#Fc6a6b",
    },
  ];
  return (
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
      <Image
        src="/maleFemale.png"
        alt=""
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default CountChart;
