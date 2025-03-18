/* eslint-disable no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData = {},
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data ? {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      departmentId: data.departmentId,
      classId: data.classId,
      teacherId: data.teacherId,
      day: data.day,
      name: data.name
    } : undefined,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    // Create base date for the time (use a reference date like 2024-01-01)
    const baseDate = new Date(2024, 0, 1); // January 1st, 2024
    
    // Set the hours and minutes from the time inputs
    if (data.startTime) {
      const startDate = new Date(baseDate);
      startDate.setHours(data.startTime.getHours(), data.startTime.getMinutes(), 0, 0);
      data.startTime = startDate;
    }
    
    if (data.endTime) {
      const endDate = new Date(baseDate);
      endDate.setHours(data.endTime.getHours(), data.endTime.getMinutes(), 0, 0);
      data.endTime = endDate;
    }

    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject session has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Safely access relatedData properties with fallbacks to empty arrays
  const departments = relatedData?.departments || [];
  const classes = relatedData?.classes || [];
  const teachers = relatedData?.teachers || [];

  // Format date-time for default values
  const formatDateTime = (dateTime: Date | undefined) => {
    if (!dateTime) return "";
    return new Date(dateTime).toISOString().slice(0, 16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Subject Session" : "Update Subject Session"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        {type === "update" && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
            defaultValue={data?.day}
          >
            <option value="">Select Day</option>
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">Saturday</option>
          </select>
          {errors.day?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.day.message.toString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Start Time</label>
          <input
            type="time"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("startTime", {
              setValueAs: (v: any) => {
                if (!v) return undefined;
                try {
                  if (v instanceof Date) return v;
                  const timeStr = String(v);
                  if (!timeStr.includes(':')) return undefined;
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                } catch (error) {
                  return undefined;
                }
              }
            })}
            defaultValue={data?.startTime ? 
              new Date(data.startTime).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
              }) : 
              undefined}
          />
          {errors.startTime?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.startTime.message.toString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">End Time</label>
          <input
            type="time"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("endTime", {
              setValueAs: (v: any) => {
                if (!v) return undefined;
                try {
                  if (v instanceof Date) return v;
                  const timeStr = String(v);
                  if (!timeStr.includes(':')) return undefined;
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                } catch (error) {
                  return undefined;
                }
              }
            })}
            defaultValue={data?.endTime ? 
              new Date(data.endTime).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit'
              }) : 
              undefined}
          />
          {errors.endTime?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.endTime.message.toString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Department</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("departmentId")}
            defaultValue={data?.departmentId}
          >
            <option value="">Select Department</option>
            {departments.map((department: { id: string; name: string }) => (
              <option value={department.id} key={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.departmentId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.departmentId.message.toString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            <option value="">Select Class</option>
            {classes.map((classItem: { id: string; name: string }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
      </div>
      
      {state.error && (
        <span className="text-campDarwinCandyPeach">
          Something went wrong! The selected time slot may already be taken for this class or teacher.
        </span>
      )}
      
      <button className="bg-campDarwinCobaltBlue text-white text-lg p-2 rounded-md">
        {type === "create" ? "Create Subject Session" : "Update Subject Session"}
      </button>
    </form>
  );
};

export default SubjectForm;
