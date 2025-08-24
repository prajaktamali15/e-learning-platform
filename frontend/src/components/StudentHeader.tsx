// src/components/StudentHeader.tsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSearch } from "../context/SearchContext";

export default function StudentHeader() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { query, setQuery } = useSearch(); // Using global search context

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setName(localStorage.getItem("name"));
      setEmail(localStorage.getItem("email"));
    }
  }, []);

  // Close dropdown when clicking outside
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    router.push("/auth/login");
  };

  const handleEditProfile = () => router.push("/student/profile");

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <span
          className="navbar-brand text-primary font-weight-bold mb-0"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/student/dashboard")}
        >
          E-Learning
        </span>

        {/* Search + Links */}
        <div className="d-flex align-items-center flex-nowrap">
          <input
            type="text"
            placeholder="Search courses or instructor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control me-3"
            style={{ maxWidth: "250px" }}
          />

          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/student/dashboard")}
          >
            Home
          </button>

          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/student/courses")}
          >
            Courses
          </button>

          <button
            className="btn btn-link nav-link mx-2"
            onClick={() => router.push("/student/courses/my-courses")}
          >
            My Courses
          </button>

          {/* Profile Dropdown */}
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
                <div className="mb-2 border-bottom pb-2">
                  <p className="mb-0"><strong>{name}</strong></p>
                  <p className="mb-0 text-muted">{email}</p>
                </div>
                <button className="dropdown-item" onClick={handleEditProfile}>
                  Edit Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
