// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import StudentHeader from "../../../components/StudentHeader";
// import { getCourses, getMyCourses, enrollInCourse, Course } from "../../../lib/api";

// interface DashboardCourse extends Course {
//   enrolled: boolean;
// }

// export default function StudentDashboard() {
//   const router = useRouter();
//   const [token, setToken] = useState<string | null>(null);
//   const [courses, setCourses] = useState<DashboardCourse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const savedToken = localStorage.getItem("token");
//     const role = localStorage.getItem("role");

//     if (!savedToken || role !== "STUDENT") {
//       router.push("/auth/login");
//       return;
//     }

//     setToken(savedToken);
//     fetchCourses(savedToken);
//   }, [router]);

//   const fetchCourses = async (token: string) => {
//     try {
//       const allCourses = await getCourses(token);
//       const enrolledCourses = await getMyCourses(token);

//       const normalizedCourses: DashboardCourse[] = allCourses.map((c: any) => ({
//         ...c,
//         id: Number(c.id),
//         description: c.description ?? "",
//         instructor: c.instructor ? { ...c.instructor, name: c.instructor.name ?? "" } : undefined,
//         enrolled: enrolledCourses.some((ec) => Number(ec.id) === Number(c.id)),
//       }));

//       setCourses(normalizedCourses);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Failed to load courses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCourseClick = (courseId: number) => router.push(`/courses/${courseId}`);
//   const handleEnroll = async (courseId: number) => {
//     if (!token) {
//       alert("Please log in to enroll in this course.");
//       return;
//     }
//     try {
//       await enrollInCourse(token, courseId);
//       alert("Successfully enrolled!");
//       setCourses((prev) =>
//         prev.map((course) => (course.id === courseId ? { ...course, enrolled: true } : course))
//       );
//     } catch (err: any) {
//       alert(err.message || "Enrollment failed");
//     }
//   };

//   if (loading) return <p className="p-4 text-center">Loading your courses...</p>;
//   if (error) return <p className="p-4 text-center text-danger">{error}</p>;
//   if (!courses.length) return <p className="p-4 text-center text-gray-600">No courses available.</p>;

//   return (
//     <div className="min-vh-100 bg-light">
//       <StudentHeader />
//       <main className="container mt-5">
//         <h1 className="display-4 text-primary mb-4">My Courses</h1>
//         <div className="row">
//           {courses.map((course) => (
//             <div key={course.id} className="col-md-4 mb-4">
//               <div className="card h-100 shadow-sm">
//                 <div className="card-body d-flex flex-column">
//                   <h5 className="card-title" style={{ cursor: "pointer" }} onClick={() => handleCourseClick(course.id)}>
//                     {course.title}
//                   </h5>
//                   <p className="card-text">{course.description}</p>
//                   {course.enrolled ? (
//                     <span className="badge bg-success mt-auto">Enrolled</span>
//                   ) : (
//                     <button className="btn btn-primary mt-auto" onClick={() => handleEnroll(course.id)}>
//                       Enroll
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }









// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import StudentHeader from "../../../components/StudentHeader";
// import { getCourses, getMyCourses, enrollInCourse, Course } from "../../../lib/api";

// interface DashboardCourse extends Course {
//   enrolled: boolean;
//   progress?: number;
//   certificateUrl?: string | null;
// }

// export default function StudentDashboard() {
//   const router = useRouter();
//   const [token, setToken] = useState<string | null>(null);
//   const [courses, setCourses] = useState<DashboardCourse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Check token and role
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const savedToken = localStorage.getItem("token");
//     const role = localStorage.getItem("role");

//     if (!savedToken || role !== "STUDENT") {
//       router.push("/auth/login");
//       return;
//     }

//     setToken(savedToken);
//     fetchCourses(savedToken);
//   }, [router]);

//   // Fetch all courses and mark enrolled courses
//   const fetchCourses = async (token: string) => {
//     try {
//       const allCourses: Course[] = await getCourses(token);
//       const enrolledCourses: Course[] = await getMyCourses(token);

//       // Map enrolled courses by id
//       const enrolledMap = new Map<number, Course>();
//       enrolledCourses.forEach((c: Course) => {
//         enrolledMap.set(Number(c.id), c); // Ensure numeric ID
//       });

//       // Normalize all courses into DashboardCourse
//       const normalizedCourses: DashboardCourse[] = allCourses.map((course: Course) => {
//         const enrolled = enrolledMap.get(Number(course.id)); // Ensure numeric ID
//         return {
//           ...course,
//           id: Number(course.id), // Fix invalid ID by converting to number
//           enrolled: !!enrolled,
//           progress: enrolled?.progress ?? 0,
//           certificateUrl: enrolled?.certificateUrl ?? null,
//         };
//       });

//       setCourses(normalizedCourses);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Failed to fetch courses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle enroll for non-enrolled courses
//   const handleEnroll = async (courseId: number) => {
//     if (!token) return;
//     try {
//       await enrollInCourse(token, courseId);
//       // Update course state
//       setCourses((prev) =>
//         prev.map((course) =>
//           course.id === courseId ? { ...course, enrolled: true, progress: 0 } : course
//         )
//       );
//     } catch (err: any) {
//       alert(err.message || "Enrollment failed");
//     }
//   };

//   // Handle course click: navigate to course content or preview
//   const handleCourseClick = (course: DashboardCourse) => {
//     if (!course.id) {
//       alert("Invalid course ID");
//       return;
//     }

//     const courseId = course.id.toString(); // ensure string for URL
//     if (course.enrolled) {
//       router.push(`/courses/${courseId}`); // Full content
//     } else {
//       router.push(`/student/courses/preview/${courseId}`); // Preview
//     }
//   };

//   if (loading) return <p className="p-6 text-center">⏳ Loading courses...</p>;
//   if (error) return <p className="p-6 text-center text-danger">{error}</p>;
//   if (!courses.length) return <p className="p-6 text-center text-muted">No courses available.</p>;

//   return (
//     <div className="min-vh-100 bg-light">
//       <StudentHeader />
//       <main className="container py-5">
//         <h2 className="text-center text-primary mb-4">📚 My Courses</h2>
//         <div className="row g-4">
//           {courses.map((course) => {
//             // SSR-safe scope: define course inside map callback
//             return (
//               <div key={course.id} className="col-md-6 col-lg-4">
//                 <div className="card h-100 shadow-sm">
//                   <div className="card-body d-flex flex-column">
//                     <h5
//                       className="card-title"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => handleCourseClick(course)}
//                     >
//                       {course.title}
//                     </h5>

//                     {course.enrolled && (
//                       <div className="mb-2">
//                         <label className="form-label small">Progress</label>
//                         <div className="progress h-3 rounded">
//                           <div
//                             className={`progress-bar ${
//                               (course.progress ?? 0) >= 100 ? "bg-success" : "bg-info"
//                             }`}
//                             style={{ width: `${course.progress ?? 0}%` }}
//                             aria-valuenow={course.progress ?? 0}
//                             aria-valuemin={0}
//                             aria-valuemax={100}
//                           >
//                             {(course.progress ?? 0).toFixed(0)}%
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     <div className="mt-auto d-flex justify-content-between align-items-center">
//                       {course.enrolled && course.certificateUrl && (
//                         <a
//                           href={course.certificateUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="btn btn-sm btn-success"
//                         >
//                           🎓 Certificate
//                         </a>
//                       )}
//                       {!course.enrolled ? (
//                         <>
//                           <button
//                             className="btn btn-outline-primary btn-sm"
//                             onClick={() => handleCourseClick(course)}
//                           >
//                             View
//                           </button>
//                           <button
//                             className="btn btn-primary btn-sm"
//                             onClick={() => handleEnroll(course.id)}
//                           >
//                             Enroll
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           className="btn btn-primary btn-sm ms-auto"
//                           onClick={() => handleCourseClick(course)}
//                         >
//                           Continue
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </main>
//     </div>
//   );
// }

// src/pages/student/dashboard/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StudentHeader from "../../../components/StudentHeader";

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const role = localStorage.getItem("role");
      const token = localStorage.getItem("token");

      // Redirect if no token or role is not STUDENT
      if (!token || role !== "STUDENT") {
        router.replace("/auth/login");
        return;
      }

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || "Student");
        } catch {
          setUserName("Student");
        }
      }
    }
  }, [router]);

  return (
    <div className="min-vh-100 bg-light">
      <StudentHeader />

      <main className="container py-5 text-center">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <h1 className="display-4 text-primary mb-3">Welcome, {userName}!</h1>
            <p className="lead text-secondary">
              Explore courses, track your progress, and enhance your skills.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
