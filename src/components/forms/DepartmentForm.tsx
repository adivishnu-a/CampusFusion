"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { departmentSchema, DepartmentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createDepartment, updateDepartment } from "@/lib/actions";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import Select from "react-select";

const DepartmentForm = ({
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
    control,
    formState: { errors },
  } = useForm<DepartmentSchema>({
    resolver: zodResolver(departmentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createDepartment : updateDepartment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Department has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, type, setOpen, router]);

  const { teachers } = relatedData;
  const teacherOptions = teachers.map((teacher: { id: string; name: string; surname: string }) => ({
    value: teacher.id,
    label: `${teacher.name} ${teacher.surname}`
  }));

  const defaultTeachers = data?.teachers
    ? teacherOptions.filter((option: { value: string }) => 
        data.teachers.includes(option.value)
      )
    : [];

  interface TeacherOption {
    value: string;
    label: string;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Department" : "Update the Department"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Department Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm text-gray-600">Teachers</label>
          <Controller
            name="teachers"
            control={control}
            defaultValue={defaultTeachers.map((t: TeacherOption) => t.value)}
            render={({ field: { onChange, value } }) => (
              <Select
                isMulti
                options={teacherOptions}
                className="text-sm"
                placeholder="Select teachers..."
                value={teacherOptions.filter((option: TeacherOption) => value?.includes(option.value))}
                onChange={(newValue) => onChange(newValue.map(v => v.value))}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.teachers ? '#f87171' : '#d1d5db',
                    borderWidth: '1.5px',
                    borderRadius: '0.375rem',
                    minHeight: '42px'
                  })
                }}
              />
            )}
          />
          {errors.teachers?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.teachers.message.toString()}
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

export default DepartmentForm;
