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
        // For teacher view
        else if (teacherId) {
          // Fetch all classes supervised by the teacher
          const classesResponse = await fetch(`/api/classes?teacherId=${teacherId}`);
          if (!classesResponse.ok) {
            throw new Error('Failed to fetch teacher classes');
          }
          const classes = await classesResponse.json();
          
          let allResults: Result[] = [];
          // Fetch results for all students in teacher's classes
          for (const cls of classes) {
            const studentsResponse = await fetch(`/api/students?classId=${cls.id}`);
            if (studentsResponse.ok) {
              const students = await studentsResponse.json();
              for (const student of students) {
                const resultsResponse = await fetch(`/api/results?studentId=${student.id}`);
                if (resultsResponse.ok) {
                  const studentResults: Result[] = await resultsResponse.json();
                  allResults = [...allResults, ...studentResults];
                }
              }
            }
          }

          if (allResults.length === 0) {
            setGpa(0);
            setRawScore(0);
            setLoading(false);
            return;
          }

          // Calculate average score across all students
          const totalScore = allResults.reduce((acc, curr) => acc + curr.score, 0);
          const avgScore = totalScore / allResults.length;
          
          setRawScore(avgScore);
          setGpa(avgScore / 20);
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