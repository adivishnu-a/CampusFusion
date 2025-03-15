"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";

const EventForm = ({
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
  // Format date-time for inputs
  const formatDateTime = (dateTimeString?: string | Date): string | undefined => {
    if (!dateTimeString) return undefined;
    const date = new Date(dateTimeString);
    return isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 16);
  };
  
  // Safe access to relatedData with fallbacks - similar to SubjectForm approach
  const classes = relatedData?.classes || [];
  
  console.log("EventForm relatedData:", relatedData);
  console.log("Classes available:", classes);
  
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

  const router = useRouter();

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
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />
        
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
          >
            <option value="">All Classes (School-wide event)</option>
            {classes && classes.map((classItem: { id: string; name: string }) => (
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
