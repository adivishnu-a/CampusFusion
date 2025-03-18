/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  surname: string;
  img?: string | null;
};

type AttendanceFormProps = {
  classId: string;
  className: string;
};

export default function AttendanceForm({ classId, className }: AttendanceFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceExists, setAttendanceExists] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Fetch students and existing attendance data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students for the class
        const studentsResponse = await fetch(`/api/students?classId=${classId}`);
        if (!studentsResponse.ok) throw new Error("Failed to fetch students");
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch attendance for current date if exists
        const attendanceResponse = await fetch(
          `/api/attendance?classId=${classId}&date=${attendanceDate}`
        );
        const attendanceData = await attendanceResponse.json();

        if (attendanceResponse.ok && attendanceData) {
          setAttendanceExists(true);
          
          // Initialize attendance state from existing data
          const attendanceState: Record<string, boolean> = {};
          studentsData.forEach((student: Student) => {
            attendanceState[student.id] = attendanceData.presentStudentIds.includes(student.id);
          });
          setAttendance(attendanceState);
        } else {
          // Initialize all students as present by default
          const attendanceState: Record<string, boolean> = {};
          studentsData.forEach((student: Student) => {
            attendanceState[student.id] = true;
          });
          setAttendance(attendanceState);
          setAttendanceExists(false);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    if (classId && attendanceDate) {
      fetchData();
    }
  }, [classId, attendanceDate]);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceDate(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API
      const presentStudentIds = Object.entries(attendance)
        .filter(([_, isPresent]) => isPresent)
        .map(([studentId]) => studentId);

      const method = attendanceExists ? "PUT" : "POST";
      
      const response = await fetch("/api/attendance", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          date: attendanceDate,
          presentStudentIds,
        }),
      });

      if (!response.ok) throw new Error("Failed to save attendance");
      
      toast.success(`Attendance ${attendanceExists ? "updated" : "saved"} successfully!`);
      setAttendanceExists(true);
      router.refresh();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campDarwinCobaltBlue"></div>
      </div>
    );
  }

  return (
    <div className="bg-campDarwinPastelSlateGray rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {className} - Attendance for {new Date(attendanceDate).toLocaleDateString()}
        </h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">
            Date:
            <input
              type="date"
              value={attendanceDate}
              onChange={handleDateChange}
              className="ml-2 p-2 border rounded-md"
            />
          </label>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            attendanceExists ? "bg-campDarwinPastelZincYellow" : "bg-campDarwinPastelBlue"
          }`}>
            {attendanceExists ? "Update Mode" : "Create Mode"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-campDarwinPastelBlue">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.img || "/noAvatar.png"}
                            alt={student.name}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name} {student.surname}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === true}
                            onChange={() => handleAttendanceChange(student.id, true)}
                            className="form-radio h-4 w-4 text-campDarwinCobaltBlue"
                          />
                          <span className="text-sm text-green-600">Present</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === false}
                            onChange={() => handleAttendanceChange(student.id, false)}
                            className="form-radio h-4 w-4 text-red-600"
                          />
                          <span className="text-sm text-red-600">Absent</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => router.refresh()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              saving || students.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-campDarwinCobaltBlue hover:bg-blue-600"
            }`}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                <span>Saving...</span>
              </div>
            ) : attendanceExists ? (
              "Update Attendance"
            ) : (
              "Save Attendance"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
