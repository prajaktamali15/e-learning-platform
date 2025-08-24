import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSearch } from "../context/SearchContext";

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { query, setQuery } = useSearch();

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("name"));
      setEmail(localStorage.getItem("email"));
      if (localStorage.getItem("token")) {
        // Logged in → redirect to dashboard immediately
        switch (localStorage.getItem("role")) {
          case "STUDENT":
            router.push("/student/dashboard");
            break;
          case "INSTRUCTOR":
            router.push("/instructor/dashboard");
            break;
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          default:
            break;
        }
      }
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
    setRole(null);
    router.push("/");
  };

  const redirectDashboard = () => {
    if (!role) return;
    switch (role) {
      case "STUDENT":
        router.push("/student/dashboard");
        break;
      case "INSTRUCTOR":
        router.push("/instructor/dashboard");
        break;
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo */}
        <span
          className="navbar-brand text-primary font-weight-bold mb-0"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          E-Learning
        </span>

        {/* Search + Links */}
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Search courses or instructor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control me-2"
            style={{ maxWidth: "300px" }}
          />

          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/")}>
            Home
          </button>

          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/courses")}>
            Courses
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
              <div className="dropdown-menu dropdown-menu-end show mt-2 p-2" style={{ minWidth: "200px" }}>
                {token ? (
                  <>
                    <div className="mb-2 border-bottom pb-2">
                      <p className="mb-0"><strong>{name}</strong></p>
                      <p className="mb-0 text-muted">{email}</p>
                      <p className="mb-0 text-muted">{role}</p>
                    </div>
                    <button className="dropdown-item" onClick={redirectDashboard}>
                      Dashboard
                    </button>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={handleLogin}>Login</button>
                    <button className="dropdown-item" onClick={handleSignup}>Signup</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
