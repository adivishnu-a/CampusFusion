"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

interface ChartData {
  grade: string;
  average: number;
}

interface Result {
  score: number;
  student: {
    class: {
      grade: {
        level: number;
      };
    };
  };
}

const PerformanceChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradePerformance = async () => {
      try {
        const response = await fetch('/api/results');
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const results: Result[] = await response.json();

        // Group results by grade level
        const gradeStats = new Map<number, { total: number; count: number }>();

        results.forEach((result) => {
          const gradeLevel = result.student.class.grade.level;
          
          if (!gradeStats.has(gradeLevel)) {
            gradeStats.set(gradeLevel, { total: 0, count: 0 });
          }
          
          const stats = gradeStats.get(gradeLevel)!;
          stats.total += result.score;
          stats.count++;
        });

        // Convert to chart data format
        const chartData = Array.from(gradeStats.entries())
          .map(([grade, stats]) => ({
            grade: `Grade ${grade}`,
            average: Math.round((stats.total / stats.count) * 100) / 100 // Round to 2 decimal places
          }))
          .sort((a, b) => parseInt(a.grade.split(' ')[1]) - parseInt(b.grade.split(' ')[1]));

        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grade performance:', error);
        setLoading(false);
      }
    };

    fetchGradePerformance();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl w-full h-full p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Grade-wise Average Performance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            dataKey="grade"
            axisLine={false}
            tick={{ fill: "#7E99A3" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis 
            axisLine={false} 
            tick={{ fill: "#7E99A3" }} 
            tickLine={false} 
            tickMargin={20}
            label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft', fill: "#7E99A3" }}
            domain={[0, 100]}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="average"
            name="Grade Average"
            stroke="#0183ff"
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;