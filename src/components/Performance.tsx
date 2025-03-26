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

interface TeacherPerformanceData {
  averageScore: number;
  totalResults: number;
}

const Performance = ({ studentId, teacherId }: { studentId?: string; teacherId?: string }) => {
  const [gpa, setGpa] = useState(0);
  const [rawScore, setRawScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateGPA = async () => {
      try {
        if (!studentId && !teacherId) {
          setLoading(false);
          return;
        }

        // For student view
        if (studentId) {
          const response = await fetch(`/api/results?studentId=${studentId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch results');
          }
          const results: Result[] = await response.json();

          if (!results || results.length === 0) {
            setGpa(0);
            setRawScore(0);
            setLoading(false);
            return;
          }

          // Calculate student GPA as before
          const examResults = results.filter((r) => r.exam !== null);
          const assignmentResults = results.filter((r) => r.assignment !== null);

          const examAvg = examResults.length > 0
            ? examResults.reduce((acc, curr) => acc + curr.score, 0) / examResults.length
            : 0;

          const assignmentAvg = assignmentResults.length > 0
            ? assignmentResults.reduce((acc, curr) => acc + curr.score, 0) / assignmentResults.length
            : 0;

          let weightedAvg = 0;
          if (examResults.length > 0 && assignmentResults.length > 0) {
            weightedAvg = ((examAvg * 2) + assignmentAvg) / 3;
          } else if (examResults.length > 0) {
            weightedAvg = examAvg;
          } else if (assignmentResults.length > 0) {
            weightedAvg = assignmentAvg;
          }

          setRawScore(weightedAvg);
          setGpa(weightedAvg / 20);
        }
        // For teacher view - OPTIMIZED VERSION
        else if (teacherId) {
          // Single API call to get teacher performance data
          const response = await fetch(`/api/results?teacherId=${teacherId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch teacher performance data');
          }
          
          const performanceData: TeacherPerformanceData = await response.json();
          
          // Use the aggregated data directly
          setRawScore(performanceData.averageScore);
          setGpa(performanceData.averageScore / 20);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error calculating GPA:', error);
        setGpa(0);
        setRawScore(0);
        setLoading(false);
      }
    };

    calculateGPA();
  }, [studentId, teacherId]);

  const chartData = [
    { name: "Score", value: rawScore, fill: "#0183ff" },
    { name: "Remaining", value: Math.max(0, 100 - rawScore), fill: "#Fc6a6b" }
  ];

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campDarwinCobaltBlue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm relative">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Performance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
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