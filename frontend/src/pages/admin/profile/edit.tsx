"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "../../../components/AdminHeader";

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:4000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userStr = localStorage.getItem("user");
      setToken(t);

      if (!t || role !== "ADMIN") {
        router.replace("/auth/login");
        return;
      }

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setName(user.name || "");
          setEmail(user.email || "");
        } catch {
          setName("");
          setEmail("");
        }
      }

      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedUser = await res.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("name", updatedUser.name || "");
      localStorage.setItem("email", updatedUser.email || "");

      alert("Profile updated successfully");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminHeader />
        <main className="container py-5 text-center">
          <p className="text-secondary">Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <main className="container py-5">
        <h1 className="text-primary mb-4">Edit Profile</h1>

        <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
