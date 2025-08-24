import { useState, useEffect } from "react";
import Header from "../components/Header";
import { getPublicCourses } from "../lib/api";
import { useSearch } from "../context/SearchContext";

interface Instructor {
  id: number;
  name: string | null; // allow null
  email: string;
}

interface Lesson {
  id: number;
  title: string;
}

interface Prerequisite {
  id: number;
  title: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  instructor?: Instructor;
  lessons?: Lesson[];
  prerequisites?: Prerequisite[];
}

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const { query } = useSearch();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getPublicCourses();
        const formattedData: Course[] = (data || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          instructor: c.instructor
            ? {
                id: c.instructor.id,
                name: c.instructor.name, // safe, can be null
                email: c.instructor.email,
              }
            : undefined,
          lessons: (c.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title,
          })),
          prerequisites: (c.prerequisites || []).map((p: any) => ({
            id: p.id,
            title: p.title,
          })),
        }));
        setCourses(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const toggleExpand = (id: number) =>
    setExpandedCourseId(expandedCourseId === id ? null : id);

  const handleEnrollClick = () =>
    alert("Please log in to enroll in this course.");

  // Filter courses as user types
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-vh-100 bg-light">
      <Header />
      <main className="container mt-5">
        <h1 className="display-4 text-primary mb-3 text-center">
          Welcome to MyLearning!
        </h1>
        <p className="lead text-secondary text-center mb-5">
          Learn from top instructors, track your progress, and advance your
          skills.
        </p>

        {loading && <p>Loading courses...</p>}
        {error && <p className="text-danger">Error: {error}</p>}

        <div className="row">
          {filteredCourses.map((course) => (
            <div key={course.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{course.title}</h5>

                  {expandedCourseId === course.id ? (
                    <>
                      <p className="card-text">{course.description}</p>
                      {course.instructor && (
                        <p className="text-muted mb-1">
                          Instructor:{" "}
                          {course.instructor.name || "Unknown"} (
                          {course.instructor.email})
                        </p>
                      )}
                      <p className="text-muted mb-1">
                        Lessons: {course.lessons?.length || 0}, Prerequisites:{" "}
                        {course.prerequisites?.length || 0}
                      </p>
                      <button
                        className="btn btn-primary mt-auto"
                        onClick={handleEnrollClick}
                      >
                        Enroll
                      </button>
                      <button
                        className="btn btn-link mt-2"
                        onClick={() => toggleExpand(course.id)}
                      >
                        Collapse
                      </button>
                    </>
                  ) : (
                    <>
                      <p
                        className="card-text text-truncate"
                        style={{ maxHeight: "3em", overflow: "hidden" }}
                      >
                        {course.description}
                      </p>
                      <button
                        className="btn btn-link mt-auto"
                        onClick={() => toggleExpand(course.id)}
                      >
                        View Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && !loading && (
            <p className="text-center">No courses found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
