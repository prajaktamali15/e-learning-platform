"use client";

import { useRouter } from "next/router";
import { useEffect, useState, ChangeEvent } from "react";
import InstructorHeader from "../../../../components/InstructorHeader";
import {
  getCourseById,
  updateCourse,
  addLesson,
  Course,
  LessonFormData,
} from "../../../../lib/api";

interface LessonForm extends LessonFormData {
  id?: number;
  title: string;
  content?: string;
  videoFile?: File | null;
  attachmentFile?: File | null;
  videoUrl?: string;
  attachmentUrl?: string;
}

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load course data
  useEffect(() => {
    if (!id) return;
    const courseId = Array.isArray(id) ? id[0] : id; // string
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    getCourseById(courseId, token)
      .then((data) => {
        setCourse(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setLessons(
          data.lessons?.map((l: any) => ({
            ...l,
            videoFile: null,
            attachmentFile: null,
          })) || []
        );
      })
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLessonChange = (
    index: number,
    field: keyof LessonForm,
    value: string | File | null
  ) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const handleFileChange = (
    index: number,
    field: "videoFile" | "attachmentFile",
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      handleLessonChange(index, field, e.target.files[0]);
    }
  };

  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      { title: "", content: "", videoFile: null, attachmentFile: null },
    ]);
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!course) return;
    const token = localStorage.getItem("token") || "";
    if (!token) {
      alert("Not authenticated");
      return;
    }
    if (!title.trim()) return alert("Title is required");

    setSaving(true);
    try {
      const courseId = Number(course.id); // Convert to number for updateCourse/addLesson

      // 1️⃣ Update course title/description
      await updateCourse(courseId, { title, description }, token);

      // 2️⃣ Upload new lessons or updated files
      for (const lesson of lessons) {
        const lessonData: LessonFormData = {
          title: lesson.title,
          content: lesson.content,
          videoFile: lesson.videoFile,
          attachmentFile: lesson.attachmentFile,
        };

        if (!lesson.id || lesson.videoFile || lesson.attachmentFile) {
          await addLesson(courseId, lessonData, token);
        }
      }

      alert("Course updated successfully");
      router.push("/instructor/courses");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading course...</p>;
  if (error) return <p className="text-center mt-4 text-danger">{error}</p>;
  if (!course) return <p className="text-center mt-4">Course not found</p>;

  return (
    <div>
      <InstructorHeader />
      <div className="container mt-4">
        <h2>Edit Course: {course.title}</h2>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Lessons */}
        <h4>Lessons</h4>
        {lessons.map((lesson, idx) => (
          <div key={idx} className="border p-3 mb-3 rounded">
            <div className="mb-2">
              <label className="form-label">Lesson Title</label>
              <input
                className="form-control"
                value={lesson.title}
                onChange={(e) =>
                  handleLessonChange(idx, "title", e.target.value)
                }
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                value={lesson.content || ""}
                onChange={(e) =>
                  handleLessonChange(idx, "content", e.target.value)
                }
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(idx, "videoFile", e)}
              />
              {lesson.videoUrl && !lesson.videoFile && (
                <p className="text-sm">Current: {lesson.videoUrl}</p>
              )}
            </div>
            <div className="mb-2">
              <label className="form-label">Attachment (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(idx, "attachmentFile", e)}
              />
              {lesson.attachmentUrl && !lesson.attachmentFile && (
                <p className="text-sm">Current: {lesson.attachmentUrl}</p>
              )}
            </div>
            <button
              className="btn btn-danger mt-2"
              onClick={() => handleRemoveLesson(idx)}
            >
              Remove Lesson
            </button>
          </div>
        ))}

        <button className="btn btn-secondary mb-3" onClick={handleAddLesson}>
          Add New Lesson
        </button>

        <div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
