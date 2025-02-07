"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

interface AnnouncementFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: {
    classes?: Array<{
      id: number;
      name: string;
    }>;
  };
}

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AnnouncementFormProps) => {
  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Announcement ${
          type === "create" ? "created" : "updated"
        } successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formAction({
      id: data?.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: new Date(formData.get("date") as string),
      classId: formData.get("classId")
        ? parseInt(formData.get("classId") as string)
        : null,
    });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create new announcement" : "Update announcement"}
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Title</label>
          <input
            name="title"
            defaultValue={data?.title}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            name="description"
            defaultValue={data?.description}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            rows={4}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Date</label>
          <input
            name="date"
            type="datetime-local"
            defaultValue={data?.date?.toISOString().slice(0, 16)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            name="classId"
            defaultValue={data?.classId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select a class</option>
            {relatedData?.classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {data && <input type="hidden" name="id" defaultValue={data?.id} />}
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
