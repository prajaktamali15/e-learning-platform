// src/pages/admin/analytics/index.tsx
"use client";

import { useEffect, useState } from "react";
import AdminHeader from "../../../components/AdminHeader";
import { useRouter } from "next/router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  coursesPerInstructor: { instructorName: string; courseCount: number }[];
  studentsPerCourse: { courseTitle: string; studentCount: number }[];
  courseStatusDistribution: { status: string; count: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const BASE_URL = "http://localhost:4000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      const t = localStorage.getItem("token");
      setToken(t);

      if (!t || role !== "ADMIN") {
        router.replace("/auth/login");
        return;
      }

      fetchAnalytics(t);
    }
  }, [router]);

  const fetchAnalytics = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data: AnalyticsData = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading analytics...</p>
        </main>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />
      <main className="container py-5">
        <h1 className="text-primary mb-4">Platform Analytics</h1>

        {/* Summary Cards */}
        <div className="d-flex justify-content-around mb-5 flex-wrap">
          <div className="card p-3 m-2 text-center" style={{ width: "200px" }}>
            <h5>Total Courses</h5>
            <p className="display-6">{analytics.totalCourses}</p>
          </div>
          <div className="card p-3 m-2 text-center" style={{ width: "200px" }}>
            <h5>Total Students</h5>
            <p className="display-6">{analytics.totalStudents}</p>
          </div>
          <div className="card p-3 m-2 text-center" style={{ width: "200px" }}>
            <h5>Total Instructors</h5>
            <p className="display-6">{analytics.totalInstructors}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5 className="text-center">Courses per Instructor</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.coursesPerInstructor}>
                <XAxis dataKey="instructorName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="courseCount" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-md-6 mb-4">
            <h5 className="text-center">Students per Course</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.studentsPerCourse}>
                <XAxis dataKey="courseTitle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="studentCount" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-12 mb-4">
            <h5 className="text-center">Course Status Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.courseStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {analytics.courseStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
