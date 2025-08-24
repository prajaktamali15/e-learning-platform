// src/pages/admin/dashboard/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsData {
  coursesPerInstructor: { instructorName: string; courseCount: number }[];
  studentsPerCourse: { courseTitle: string; studentCount: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Admin");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [pendingCourses, setPendingCourses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userStr = localStorage.getItem("user");

    if (!token || role !== "ADMIN") {
      router.replace("/auth/login");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Admin");
      } catch {
        setUserName("Admin");
      }
    } else {
      const name = localStorage.getItem("name");
      setUserName(name || "Admin");
    }

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    const BASE_URL = "http://localhost:4000";

    try {
      // Fetch analytics
      const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      const analyticsData: AnalyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch courses
      const coursesRes = await fetch(`${BASE_URL}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      const coursesData: any[] = await coursesRes.json();
      setTotalCourses(coursesData.length);
      setPendingCourses(coursesData.filter(c => c.status === "PENDING").length);

      // Fetch users
      const usersRes = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData: any[] = await usersRes.json();
      setTotalUsers(usersData.length);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <main className="container py-5">
        <h1 className="text-primary mb-4">Welcome, {userName}!</h1>
        <p className="text-secondary mb-5">
          Manage users, courses, and track platform performance here.
        </p>

        {/* Summary Cards */}
        <div className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h5>Total Courses</h5>
              <h2 className="text-primary">{totalCourses}</h2>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h5>Total Users</h5>
              <h2 className="text-primary">{totalUsers}</h2>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h5>Pending Approvals</h5>
              <h2 className="text-warning">{pendingCourses}</h2>
            </div>
          </div>
        </div>

        {/* Analytics Graphs */}
        {analytics && (
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3">Courses per Instructor</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.coursesPerInstructor.map(c => ({
                      instructor: c.instructorName,
                      count: c.courseCount,
                    }))}
                  >
                    <XAxis dataKey="instructor" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0d6efd" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3">Students per Course</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.studentsPerCourse.map(s => ({
                      course: s.courseTitle,
                      count: s.studentCount,
                    }))}
                  >
                    <XAxis dataKey="course" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#198754" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
