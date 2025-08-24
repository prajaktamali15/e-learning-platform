// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import InstructorHeader from "../../../components/InstructorHeader";
// import { getInstructorCourses, Course } from "../../../lib/api";
// import classNames from "classnames";

// interface DashboardCourse extends Course {
//   enrolledCount?: number; // Optional property for dashboard display
// }

// export default function InstructorDashboard() {
//   const router = useRouter();
//   const [token, setToken] = useState<string | null>(null);
//   const [courses, setCourses] = useState<DashboardCourse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

//   // Get token & check role (client-side only)
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (!storedToken || role !== "INSTRUCTOR") {
//       router.replace("/auth/login");
//       return;
//     }
//     setToken(storedToken);
//   }, [router]);

//   // Fetch instructor courses
//   useEffect(() => {
//     if (!token) return;

//     const fetchCourses = async () => {
//       setLoading(true);
//       try {
//         const coursesData = await getInstructorCourses(token);
//         // Safely calculate enrolledCount
//         const updatedCourses = coursesData.map((c) => ({
//           ...c,
//           enrolledCount: Array.isArray((c as any).enrollments) ? (c as any).enrollments.length : 0,
//         }));
//         setCourses(updatedCourses);
//       } catch (err) {
//         console.error("Error fetching courses:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, [token]);

//   const handleExpand = (id: number) => {
//     setExpandedCourseId(expandedCourseId === id ? null : id);
//   };

//   const handleEditCourse = (id: number) => {
//     router.push(`/instructor/courses/${id}`);
//   };

//   if (loading) return <p className="p-6 text-center">⏳ Loading courses...</p>;

//   return (
//     <div className="min-vh-100 bg-light">
//       <InstructorHeader />

//       <div className="container py-5">
//         <h2 className="text-center text-primary mb-4">
//           👋 Welcome Instructor
//         </h2>

//         {courses.length === 0 && (
//           <p className="text-center text-muted">No courses available.</p>
//         )}

//         <div className="list-group">
//           {courses.map((course) => {
//             const isExpanded = expandedCourseId === course.id;
//             return (
//               <div
//                 key={course.id}
//                 className={classNames(
//                   "list-group-item mb-2 rounded shadow-sm",
//                   { "bg-info bg-opacity-25": isExpanded },
//                   { "bg-white": !isExpanded }
//                 )}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => handleExpand(course.id)}
//               >
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h5 className="mb-0">{course.title}</h5>
//                   <span>
//                     Enrolled: {course.enrolledCount ?? 0}
//                   </span>
//                 </div>

//                 {isExpanded && (
//                   <div className="mt-3">
//                     <p className="text-muted">{course.description}</p>
//                     <div className="d-flex gap-2 mt-3">
//                       <button
//                         className="btn btn-success btn-sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleEditCourse(course.id);
//                         }}
//                       >
//                         ✏️ Edit
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InstructorHeader from "../../../components/InstructorHeader";
import { getInstructorCourses, Course } from "../../../lib/api";

export default function InstructorDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      const n = localStorage.getItem("name");
      setToken(t);
      setName(n);

      if (t) {
        getInstructorCourses(t)
          .then((data) => {
            // Only show published courses for Home Dashboard
            const publishedCourses = data.filter((c) => c.status === "PUBLISHED");
            setCourses(publishedCourses);
          })
          .catch((err) => console.error(err));
      }
    }
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  return (
    <div>
      <InstructorHeader />
      <div className="container mt-4">
        {/* Welcome message */}
        <h2 className="mb-4">Welcome, {name || "Instructor"}!</h2>

        {/* Published courses list */}
        {courses.length === 0 ? (
          <p>No published courses found.</p>
        ) : (
          <div className="row">
            {courses.map((course) => (
              <div key={course.id} className="col-md-6 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title">{course.title}</h5>
                      <span className="badge bg-success">{course.status}</span>
                    </div>

                    {expandedCourseId === course.id && (
                      <div className="mt-3">
                        <p>Lessons: {course.lessons?.length || 0}</p>
                        <p>Enrollments: {course.enrollments?.length || 0}</p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => router.push(`/instructor/courses/${course.id}/lessons`)}
                          >
                            Add Lesson
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => router.push(`/instructor/courses/${course.id}/prerequisites`)}
                          >
                            Add Prerequisite
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => router.push(`/instructor/courses/${course.id}`)}
                          >
                            View Course
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-link mt-2 p-0"
                      onClick={() => toggleExpand(course.id)}
                    >
                      {expandedCourseId === course.id ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

