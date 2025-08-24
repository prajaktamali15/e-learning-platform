"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import InstructorLayout from "../../../components/InstructorLayout";
import { createCourse, addLesson, LessonFormData } from "../../../lib/api";
import { toast } from "react-hot-toast";

interface LessonForm extends LessonFormData {}

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddLesson = () => {
    setLessons([...lessons, { title: "", content: "", videoFile: null, attachmentFile: null }]);
  };

  const handleLessonChange = (index: number, field: keyof LessonForm, value: any) => {
    const updated = [...lessons];
    (updated[index] as any)[field] = value;
    setLessons(updated);
  };

  const handleAddPrerequisite = () => setPrerequisites([...prerequisites, ""]);
  const handlePrerequisiteChange = (index: number, value: string) => {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  };
  const handleRemovePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      toast.loading("Creating course...");

      // Step 1: Create course (draft mode)
      const course = await createCourse({ title, description, prerequisites }, token);

      // Step 2: Upload lessons
      for (const lesson of lessons) {
        await addLesson(course.id, lesson, token);
      }

      toast.dismiss();
      toast.success("Course created successfully!");
      router.push("/instructor/courses");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="container my-4">
        <h1 className="mb-4">Create New Course</h1>

        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          {/* Course Title */}
          <div className="mb-3">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Course Description */}
          <div className="mb-3">
            <label className="form-label">Course Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              rows={3}
            />
          </div>

          {/* Prerequisites */}
          <div className="mb-3">
            <label className="form-label">Prerequisites</label>
            {prerequisites.map((pre, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Prerequisite"
                  value={pre}
                  onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                />
                <button type="button" className="btn btn-outline-danger" onClick={() => handleRemovePrerequisite(index)}>
                  X
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-success btn-sm" onClick={handleAddPrerequisite}>
              + Add Prerequisite
            </button>
          </div>

          {/* Lessons */}
          <div className="mb-3">
            <h5>Lessons</h5>
            {lessons.map((lesson, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    className="form-control mb-2"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Lesson Content"
                    className="form-control mb-2"
                    value={lesson.content || ""}
                    onChange={(e) => handleLessonChange(index, "content", e.target.value)}
                    rows={2}
                  />
                  <input
                    type="file"
                    accept="video/*"
                    className="form-control mb-2"
                    onChange={(e) => handleLessonChange(index, "videoFile", e.target.files?.[0] || null)}
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="form-control mb-2"
                    onChange={(e) => handleLessonChange(index, "attachmentFile", e.target.files?.[0] || null)}
                  />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setLessons(lessons.filter((_, i) => i !== index))}>
                    Remove Lesson
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddLesson}>
              + Add Lesson
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-success w-100">
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </InstructorLayout>
  );
}
