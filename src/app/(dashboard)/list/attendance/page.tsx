"use client";

import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import AttendanceForm from "@/components/forms/AttendanceForm";

type Class = {
  id: string;
  name: string;
};

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // const [userRole, setUserRole] = useState<string | null>(null);
  // const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchUserRoleAndClasses = async () => {
      try {
        setLoading(true);
        
        // Fetch user role
        const response = await fetch("/api/user/role");
        const userData = await response.json();
        // setUserRole(userData.role);
        
        // Fetch classes based on role
        let classesResponse;
        if (userData.role === "admin") {
          classesResponse = await fetch("/api/classes");
        } else if (userData.role === "teacher") {
          classesResponse = await fetch(`/api/classes?teacherId=${userData.userId}`);
        }
        
        if (classesResponse && classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndClasses();
  }, [userId]);

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Attendance Management</h1>
      </div>

      {/* CLASS SELECTION */}
      <div className="mb-6">
        <h2 className="font-medium mb-3">Select Class</h2>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-campDarwinCobaltBlue"></div>
            <p>Loading classes...</p>
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className={`border rounded-md p-3 cursor-pointer hover:bg-campDarwinPastelBlue transition-colors ${
                  selectedClass === classItem.id ? "bg-campDarwinPastelBlue border-campDarwinCobaltBlue" : "bg-white"
                }`}
                onClick={() => handleClassSelect(classItem.id)}
              >
                <div className="flex items-center space-x-2">
                  <Image src="/class.png" alt="Class" width={20} height={20} />
                  <span>{classItem.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No classes available.</p>
        )}
      </div>

      {/* ATTENDANCE FORM */}
      {selectedClass && (
        <AttendanceForm 
          classId={selectedClass}
          className={classes.find(c => c.id === selectedClass)?.name || ""}
        />
      )}
    </div>
  );
}
