"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";

const AssignmentForm = ({
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
  // Convert ISO date strings to YYYY-MM-DD format
  const formatDate = (dateString?: string | Date): string | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
  };

  const defaultValues: any = {
    title: data?.title || "",
    subjectId: data?.subjectId || "",
  };
  
  // Only add id if it exists
  if (data?.id) {
    defaultValues.id = data.id;
  }

  // Format dates properly
  const startDateStr = formatDate(data?.startDate);
  const dueDateStr = formatDate(data?.dueDate);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Assignment" : "Update the Assignment"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Assignment Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <InputField
          label="Start Date"
          name="startDate"
          defaultValue={startDateStr}
          register={register}
          error={errors?.startDate}
          type="date"
        />
        
        <InputField
          label="Due Date"
          name="dueDate"
          defaultValue={dueDateStr}
          register={register}
          error={errors?.dueDate}
          type="date"
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
          <label className="text-sm text-gray-600">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            <option value="">Select Subject</option>
            {subjects?.map(
              (subject: { id: string; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              )
            ) || []}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-campDarwinCandyPeach">Something went wrong! Please check your inputs.</span>
      )}
      <button className="bg-campDarwinCobaltBlue text-white text-lg p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
