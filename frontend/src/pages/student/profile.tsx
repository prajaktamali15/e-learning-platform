// src/pages/student/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/StudentHeader";

export default function StudentProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [profile, setProfile] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // -----------------------------
  // Load profile from localStorage
  // -----------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedName = localStorage.getItem("name");
      const storedEmail = localStorage.getItem("email");
      const storedRole = localStorage.getItem("role");
      const storedProfile = localStorage.getItem("profile");

      if (!storedToken) {
        router.push("/auth/login");
        return;
      }

      setToken(storedToken);
      setName(storedName || "");
      setEmail(storedEmail || "");
      setRole(storedRole || "");
      setProfile(storedProfile || null);
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // Update profile info
  // -----------------------------
  const handleSaveProfile = async () => {
    if (!token) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/students/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);

      setMessage("✅ Profile updated successfully!");
    } catch (err: any) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Change password
  // -----------------------------
  const handleChangePassword = async () => {
    if (!token) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("⚠️ Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("⚠️ New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/students/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("✅ Password changed successfully!");
    } catch (err: any) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Upload profile photo
  // -----------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewSrc(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUploadPhoto = async () => {
    if (!token || !selectedFile) return;

    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("photo", selectedFile); // backend expects 'photo'

    try {
      const res = await fetch("http://localhost:4000/students/profile/photo", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload photo");

      setProfile(data.path); // backend returns 'path'
      localStorage.setItem("profile", data.path);
      setMessage("✅ Profile photo updated successfully!");
      setSelectedFile(null);
      setPreviewSrc(null);
    } catch (err: any) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <>
      <Header />
      <div className="container py-5">
        <h2 className="mb-4">My Profile</h2>

        {message && <div className="alert alert-info">{message}</div>}

        {/* Profile Photo */}
        <div className="card mb-4 shadow-sm p-4">
          <h5>Profile Photo</h5>
          <div className="mb-3 d-flex align-items-center">
            <img
              src={previewSrc || profile || "/profile.png"}
              alt="Profile"
              className="rounded-circle me-3"
              style={{ width: 80, height: 80 }}
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleUploadPhoto}
            disabled={saving || !selectedFile}
          >
            {saving ? "Uploading..." : "Upload Photo"}
          </button>
        </div>

        {/* Profile Info */}
        <div className="card mb-4 shadow-sm p-4">
          <h5>Profile Information</h5>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={role} disabled />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Change Password */}
        <div className="card shadow-sm p-4">
          <h5>Change Password</h5>
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
          <button
            className="btn btn-warning"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </>
  );
}
