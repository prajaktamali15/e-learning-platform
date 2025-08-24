"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

export default function InstructorHeader() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setName(localStorage.getItem("name"));
      setEmail(localStorage.getItem("email"));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => setDropdownOpen(!dropdownOpen);
  const handleLogin = () => router.push("/auth/login");
  const handleSignup = () => router.push("/auth/register");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setToken(null);
    router.push("/");
  };

  const handleEditProfile = () => router.push("/instructor/ProfilePage");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    // Navigate to search page (you can replace this with live fetch if needed)
    router.push(`/instructor/search?query=${encodeURIComponent(search)}`);
    setSearch("");
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo + Search */}
        <div className="d-flex align-items-center flex-grow-1">
          <span
            className="navbar-brand text-primary font-weight-bold mb-0 me-3"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/instructor/dashboard")}
          >
            E-Learning
          </span>

          <form onSubmit={handleSearch} className="d-flex flex-grow-1">
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Navigation links */}
        <div className="d-flex align-items-center mx-3">
          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/instructor/dashboard")}
          >
            Home
          </button>
          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/instructor/courses/my-courses")}
          >
            My Courses
          </button>
          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/instructor/courses/analytics")}
          >
            Analytics
          </button>
        </div>

        {/* Profile dropdown */}
        <div className="position-relative ms-3" ref={dropdownRef}>
          <img
            src="/profile.png"
            alt="Profile"
            className="rounded-circle"
            style={{ width: 36, height: 36, cursor: "pointer" }}
            onClick={handleProfileClick}
          />
          {dropdownOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 p-2"
              style={{ minWidth: "200px" }}
            >
              {token ? (
                <>
                  <div className="mb-2 border-bottom pb-2">
                    <p className="mb-0">
                      <strong>{name}</strong>
                    </p>
                    <p className="mb-0 text-muted">{email}</p>
                  </div>
                  <button className="dropdown-item" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="dropdown-item" onClick={handleLogin}>
                    Login
                  </button>
                  <button className="dropdown-item" onClick={handleSignup}>
                    Signup
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
