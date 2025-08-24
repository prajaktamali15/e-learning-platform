"use client";

import { useRouter } from "next/router";
import { useEffect, useState, ChangeEvent } from "react";
import InstructorHeader from "../../../../components/InstructorHeader";
import {
  getCourseById,
  Course,
  addLesson,
  deleteLesson,
  updateLesson,
  LessonFormData
} from "../../../../lib/api";

export default function CourseContentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const fetchCourse = () => {
    if (!id || !token) return;
    const courseId = Array.isArray(id) ? id[0] : id;
    getCourseById(courseId, token)
      .then((data) => setCourse(data))
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourse();
  }, [id, token]);

  // -------------------- ADD OR UPDATE LESSON --------------------
  const handleSaveLesson = async () => {
    if (!lessonTitle) return alert("Lesson title is required");

    try {
      const courseIdNum = Array.isArray(id) ? Number(id[0]) : Number(id);

      if (editingLessonId) {
        // Update existing lesson
        await updateLesson(editingLessonId, {
          title: lessonTitle,
          content: lessonContent,
          videoFile,
          attachmentFile,
        }, token);
        alert("Lesson updated successfully");
      } else {
        // Add new lesson
        const lessonData: LessonFormData = { title: lessonTitle, content: lessonContent };
        if (videoFile) lessonData.videoFile = videoFile;
        if (attachmentFile) lessonData.attachmentFile = attachmentFile;

        await addLesson(courseIdNum, lessonData, token);
        alert("Lesson added successfully");
      }

      // Reset form
      setLessonTitle("");
      setLessonContent("");
      setVideoFile(null);
      setAttachmentFile(null);
      setEditingLessonId(null);

      fetchCourse();
    } catch (err) {
      console.error(err);
      alert("Failed to save lesson");
    }
  };

  const handleEditLesson = (lesson: any) => {
    if (!lesson.id) return;
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content || "");
    setEditingLessonId(lesson.id);
    setVideoFile(null);
    setAttachmentFile(null);
  };

  const handleDeleteLesson = async (lessonId?: number) => {
    if (!lessonId) return;
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await deleteLesson(lessonId, token);
      alert("Lesson deleted successfully");
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lessons: prev.lessons?.filter((l) => l.id !== lessonId),
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete lesson");
    }
  };

  // -------------------- HANDLE FILE INPUTS --------------------
  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setVideoFile(e.target.files[0]);
  };

  const handleAttachmentChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAttachmentFile(e.target.files[0]);
  };

  if (loading) return <p className="text-center mt-4">Loading course...</p>;
  if (error) return <p className="text-center mt-4 text-danger">{error}</p>;
  if (!course) return <p className="text-center mt-4">Course not found</p>;

  return (
    <div>
      <InstructorHeader />
      <div className="container mt-4">
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2>{course.title}</h2>
            <p>{course.description || "No description"}</p>
          </div>
        </div>

        <h3>Lessons</h3>
        {course.lessons?.length ? (
          course.lessons.map((lesson, index) => (
            <div key={lesson.id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <h5>{index + 1}. {lesson.title}</h5>
                <p>{lesson.content || "No content"}</p>
                {lesson.videoUrl && (
                  <video width="100%" controls src={`http://localhost:4000${lesson.videoUrl}`} />
                )}
                {lesson.attachmentUrl && (
                  <a href={`http://localhost:4000${lesson.attachmentUrl}`} target="_blank" className="btn btn-outline-primary btn-sm">
                    Download Attachment
                  </a>
                )}
                <div className="mt-2 d-flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEditLesson(lesson)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLesson(lesson.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No lessons added yet.</p>
        )}

        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <h4>{editingLessonId ? "Edit Lesson" : "Add New Lesson"}</h4>
            <input type="text" placeholder="Lesson Title" className="form-control mb-2" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            <textarea placeholder="Lesson Content" className="form-control mb-2" value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} />

            <input type="file" accept="video/mp4" className="form-control mb-2" onChange={handleVideoChange} />
            <input type="file" accept="application/pdf" className="form-control mb-2" onChange={handleAttachmentChange} />

            <button className="btn btn-primary" onClick={handleSaveLesson}>
              {editingLessonId ? "Update Lesson" : "Add Lesson"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
