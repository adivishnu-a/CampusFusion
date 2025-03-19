"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

const AnnouncementForm = ({
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
  
  // Format date for inputs
  const formatDate = (dateString?: string | Date): string | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
  };

  // Fetch classes from API if needed
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // First try to use classes from relatedData
        if (relatedData?.classes && Array.isArray(relatedData.classes) && relatedData.classes.length > 0) {
          console.log(`Using ${relatedData.classes.length} classes from relatedData`);
          setClasses(relatedData.classes);
        } else {
          // If not available, fetch from API
          console.log("Fetching classes from API");
          const response = await fetch('/api/classes');
          if (response.ok) {
            const data = await response.json();
            console.log(`Fetched ${data.length} classes from API`);
            setClasses(data);
          } else {
            console.error("Failed to fetch classes:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [relatedData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: type === "update" 
      ? {
          id: data?.id,
          title: data?.title || "",
          description: data?.description || "",
          classId: data?.classId || "",
          date: data?.date ? new Date(data.date) : new Date(),
        } 
      : {
          date: new Date()
        }
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Submitting announcement data:", data);
    formAction(data);
  });

  useEffect(() => {
    if (state.success) {
      toast(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const dateValue = formatDate(data?.date);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Announcement" : "Update Announcement"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Announcement Title"
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
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>
        
        <InputField
          label="Date"
          name="date"
          defaultValue={dateValue}
          register={register}
          error={errors?.date}
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
          <label className="text-sm text-gray-600">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
            disabled={loading}
          >
            <option value="">All Classes (School-wide)</option>
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
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            {loading ? "Loading classes..." : `${classes.length} classes available`}
          </p>
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong! Please check your inputs.</span>
      )}
      <button className="bg-campDarwinCobaltBlue text-white text-lg p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;