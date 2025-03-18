"use client";

import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface Subject {
  name: string;
  teacherId: string;
  class: {
    name: string;
  };
}

interface Result {
  score: number;
  exam: {
    subject: Subject;
  } | null;
  assignment: {
    subject: Subject;
  } | null;
  student: {
    name: string;
    surname: string;
    class: {
      name: string;
    };
  };
}

const Performance = ({ studentId }: { studentId: string }) => {
  const [gpa, setGpa] = useState(0);
  const [rawScore, setRawScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateGPA = async () => {
      try {
        const response = await fetch(`/api/results?studentId=${studentId}`);
        if (!response.ok) {
          console.error('Failed to fetch results:', await response.text());
          throw new Error('Failed to fetch results');
        }
        const results: Result[] = await response.json();

        if (!results || results.length === 0) {
          setGpa(0);
          setRawScore(0);
          setLoading(false);
          return;
        }

        // Separate exam and assignment results
        const examResults = results.filter((r) => r.exam !== null);
        const assignmentResults = results.filter((r) => r.assignment !== null);

        // Calculate weighted averages (exams count twice as much)
        const examAvg = examResults.length > 0
          ? examResults.reduce((acc, curr) => acc + curr.score, 0) / examResults.length
          : 0;

        const assignmentAvg = assignmentResults.length > 0
          ? assignmentResults.reduce((acc, curr) => acc + curr.score, 0) / assignmentResults.length
          : 0;

        // Calculate final weighted average (exams:assignments = 2:1)
        let weightedAvg = 0;
        if (examResults.length > 0 && assignmentResults.length > 0) {
          weightedAvg = ((examAvg * 2) + assignmentAvg) / 3;
        } else if (examResults.length > 0) {
          weightedAvg = examAvg;
        } else if (assignmentResults.length > 0) {
          weightedAvg = assignmentAvg;
        }

        setRawScore(weightedAvg);
        // Convert to GPA scale (divide by 20 to get 0-5 scale)
        setGpa(weightedAvg / 20);
        setLoading(false);
      } catch (error) {
        console.error('Error calculating GPA:', error);
        setGpa(0);
        setRawScore(0);
        setLoading(false);
      }
    };

    calculateGPA();
  }, [studentId]);

  const chartData = [
    { name: "Score", value: rawScore, fill: "#0183ff" },
    { name: "Remaining", value: Math.max(0, 100 - rawScore), fill: "#Fc6a6b" }
  ];


  if (loading) {
    return (
      <div className="bg-white p-4 shadow-sm rounded-md h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campDarwinCobaltBlue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow-sm rounded-md h-80 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Performance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-bold">{gpa.toFixed(2)}</h1>
        <p className="text-sm text-gray-500">GPA</p>
      </div>
      <h2 className="font-medium absolute bottom-16 left-0 right-0 m-auto text-center">
        Based on {rawScore.toFixed(1)}% score average
      </h2>
    </div>
  );
};

export default Performance;