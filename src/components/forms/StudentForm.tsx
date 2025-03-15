"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createStudent, updateStudent } from "@/lib/actions";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [state, formAction] = useFormState<
    { success: boolean; error: boolean },
    FormData
  >(type === "create" ? createStudent : updateStudent, {
    success: false,
    error: false,
  });

  const validateImage = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 100 * 1024; // 100KB
    if (!validTypes.includes(file.type)) {
      return "Only JPG, JPEG and PNG files are allowed";
    }
    if (file.size > maxSize) {
      return "Image size should be less than 100KB";
    }
    return null;
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImageError(null);
      if (file) {
        const error = validateImage(file);
        if (error) {
          setImageError(error);
          e.target.value = "";
          return;
        }
        setImageFile(file);
      }
    },
    []
  );

  const onSubmit = handleSubmit((formData) => {
    if (imageError) {
      return;
    }
    const submitData = new FormData();
    submitData.append(
      "data",
      JSON.stringify({
        ...formData,
      })
    );
    if (imageFile) {
      submitData.append("file", imageFile);
    }
    formAction(submitData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  const { departments } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Student" : "Update the Student"}
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
          <p className="text-xs text-green-600">
            Image selected: {imageFile.name}
          </p>
        )}
      </div>
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
        <InputField
          label="Parent Id"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors.parentId}
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-600">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-600">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  {classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacity
                </option>
              )
            )}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-campDarwinCandyPeach">
              {errors.gradeId.message.toString()}
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

export default StudentForm;
