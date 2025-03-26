"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { TeacherSchema, teacherSchema } from "../../lib/formValidationSchemas";
import React, { Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [state, formAction] = useFormState<
  { success: boolean; error: boolean },FormData
>(type === "create" ? createTeacher : updateTeacher, {
  success: false,
  error: false,
});

  const validateImage = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 100 * 1024; // 100KB
    if (!validTypes.includes(file.type)) {
      return 'Only JPG, JPEG and PNG files are allowed';
    }
    if (file.size > maxSize) {
      return 'Image size should be less than 100KB';
    }
    return null;
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (file) {
      const error = validateImage(file);
      if (error) {
        setImageError(error);
        e.target.value = '';
        return;
      }
      setImageFile(file);
    }
  }, []);

  const onSubmit = handleSubmit((formData) => {
    if (imageError) {
      return;
    }
    const submitData = new FormData();
    submitData.append('data', JSON.stringify({
      ...formData,
    }));
    if (imageFile) {
      submitData.append('file', imageFile);
    }
    formAction(submitData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { departments } = relatedData;
  const departmentOptions = departments?.map((department: { id: string; name: string }) => ({
    value: department.id,
    label: department.name
  })) || [];

  const defaultDepartments = data?.departments
    ? departmentOptions.filter((option: { value: string }) => 
        data.departments.includes(option.value)
      )
    : [];

  interface DepartmentOption {
    value: string;
    label: string;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Teacher" : "Update the Teacher"}
      </h1>
      <span className="text-md text-gray-500 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-md text-gray-500 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-sm text-gray-600">Gender</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
            defaultValue={data?.gender}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.gender?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.gender.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm text-gray-600">Departments</label>
          <Controller
            name="departments"
            control={control}
            defaultValue={defaultDepartments.map((d: DepartmentOption) => d.value)}
            render={({ field: { onChange, value } }) => (
              <Select
                isMulti
                options={departmentOptions}
                className="text-sm"
                placeholder="Select departments..."
                value={departmentOptions.filter((option: DepartmentOption) => value?.includes(option.value))}
                onChange={(newValue) => onChange(newValue.map(v => v.value))}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.departments ? '#f87171' : '#d1d5db',
                    borderWidth: '1.5px',
                    borderRadius: '0.375rem',
                    minHeight: '42px'
                  })
                }}
              />
            )}
          />
          {errors.departments?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.departments.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-sm text-gray-600 flex items-center gap-3 cursor-pointer"
            htmlFor="img"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload your Picture</span>
          </label>
          <input 
            type="file" 
            id="img" 
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleImageChange}
            className="hidden" 
          />
          {imageError && (
            <p className="text-xs text-campDarwinCandyPeach">{imageError}</p>
          )}
          {imageFile && (
            <p className="text-xs text-green-600">Image selected: {imageFile.name}</p>
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

export default TeacherForm;
