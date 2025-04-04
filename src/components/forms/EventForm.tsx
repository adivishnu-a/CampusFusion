/* eslint-disable no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const [classes, setClasses] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  
  // Format date-time for inputs
  const formatDateTime = (dateTimeString?: string | Date): string | undefined => {
    if (!dateTimeString) return undefined;
    const date = new Date(dateTimeString);
    return isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 16);
  };

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log("Fetching classes from API");
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched ${data.length} classes from API`);
          setClasses(data);
        } else {
          console.error("Failed to fetch classes:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: type === "update" ? {
      id: data?.id,
      title: data?.title || "",
      description: data?.description || "",
      classId: data?.classId || "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
    } : undefined
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting event form with data:", data);
    formAction(data);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Event" : "Update the Event"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Event Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            {...register("description")}
            defaultValue={data?.description}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
          />
          {errors.description?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.description.message.toString()}
            </p>
          )}
        </div>
        
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={formatDateTime(data?.startTime)}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={formatDateTime(data?.endTime)}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        
        {data?.id && (
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
          <label className="text-sm text-gray-600">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
            disabled={loading}
          >
            <option value="">All Classes (School-wide event)</option>
            {loading ? (
              <option value="" disabled>Loading classes...</option>
            ) : classes.length > 0 ? (
              classes.map((classItem) => (
                <option value={classItem.id} key={classItem.id}>
                  {classItem.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No classes available</option>
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.classId.message.toString()}
            </p>
          )}
          
          {/* Debug information - can be removed in production */}
          <p className="text-xs text-gray-500">
            {loading ? "Loading classes..." : `${classes.length} classes available`}
          </p>
        </div>
      </div>
      {state.error && (
        <span className="text-campDarwinCandyPeach">Something went wrong!</span>
      )}
      <button className="bg-campDarwinCobaltBlue text-white text-lg p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm;
