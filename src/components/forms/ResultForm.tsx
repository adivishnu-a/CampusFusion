"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";

const ResultForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data ? {
      id: data?.id,
      score: data?.score,
      studentId: data?.studentId,
      examId: data?.examId || "",
      assignmentId: data?.assignmentId || "",
      assessmentType: data?.examId ? "exam" : "assignment"
    } : {
      assessmentType: "exam" // Default to exam
    }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const assessmentType = watch("assessmentType");

  // Update hidden fields when assessment type changes
  useEffect(() => {
    if (assessmentType === "exam") {
      setValue("assignmentId", "");
    } else {
      setValue("examId", "");
    }
  }, [assessmentType, setValue]);

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students, exams, assignments } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Result" : "Update the Result"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
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
          <label className="text-sm text-gray-600">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
          >
            <option value="">Select Student</option>
            {students?.map((student: { id: string; name: string; surname: string }) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
        
        <InputField
          label="Score"
          name="score"
          type="number"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-sm text-gray-600">Assessment Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("assessmentType")}
          >
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>
        
        {assessmentType === "exam" && (
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-sm text-gray-600">Exam</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId")}
            >
              <option value="">Select Exam</option>
              {exams?.map((exam: { id: string; title: string }) => (
                <option value={exam.id} key={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {errors.examId?.message && (
              <p className="text-xs text-campDarwinCandyPeach">
                {errors.examId.message.toString()}
              </p>
            )}
          </div>
        )}
        
        {assessmentType === "assignment" && (
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-sm text-gray-600">Assignment</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId")}
            >
              <option value="">Select Assignment</option>
              {assignments?.map((assignment: { id: string; title: string }) => (
                <option value={assignment.id} key={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
            {errors.assignmentId?.message && (
              <p className="text-xs text-campDarwinCandyPeach">
                {errors.assignmentId.message.toString()}
              </p>
            )}
          </div>
        )}
      </div>
      
      {state.error && (
        <span className="text-campDarwinCandyPeach">
          Something went wrong! Please check your inputs.
        </span>
      )}
      
      <button className="bg-campDarwinCobaltBlue text-white text-lg p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
