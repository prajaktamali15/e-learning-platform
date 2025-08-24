"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InstructorHeader from "@/components/InstructorHeader";

interface Instructor {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function InstructorProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("token");
    if (!t) {
      router.replace("/auth/login");
      return;
    }
    setToken(t);

    fetch("http://localhost:4000/instructors/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInstructor(data);
        setName(data.name);
        setEmail(data.email);
      })
      .catch((err) => console.error(err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      if (!token) throw new Error("Unauthorized");

      const body: any = { name, email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("http://localhost:4000/instructors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updated = await res.json();
      setInstructor(updated);
      localStorage.setItem("name", updated.name);
      localStorage.setItem("email", updated.email);
      setMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Failed to update profile");
    }
  };

  if (!instructor) return <p>Loading profile...</p>;

  return (
    <div>
      <InstructorHeader />
      <div className="container mt-5 max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        {message && <p className="text-danger">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <hr />

          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
