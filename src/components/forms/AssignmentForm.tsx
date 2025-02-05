"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { InputField } from "@/components/InputField";

interface AssignmentFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: {
    lessons: Array<{
      id: number;
      name: string;
      subject: { name: string };
      class: { name: string };
    }>;
  };
}

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AssignmentFormProps) => {
  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Assignment ${type === "create" ? "created" : "updated"} successfully!`
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
      dueDate: new Date(formData.get("dueDate") as string),
      lessonId: parseInt(formData.get("lessonId") as string),
    });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create new assignment" : "Update assignment"}
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
        {/* //TODO: add  description String in assignment schema then use it*/}
        {/* <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            name="description"
            defaultValue={data?.description}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            rows={4}
            required
          />
        </div> */}

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Due Date</label>
          <input
            name="dueDate"
            type="datetime-local"
            defaultValue={data?.dueDate?.toISOString().slice(0, 16)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            name="lessonId"
            defaultValue={data?.lessonId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            required
          >
            <option value="">Select a lesson</option>
            {relatedData?.lessons?.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.subject.name} ({lesson.class.name})
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

export default AssignmentForm;
