// src/admin/components/AdminHeader.tsx
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";

interface SearchResult {
  id: number;
  type: "course" | "user";
  name: string;
  extra?: string; // instructor name for course, role for user
}

export default function AdminHeader() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setName(localStorage.getItem("name"));
      setEmail(localStorage.getItem("email"));
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    router.push("/admin/dashboard");
  };

  const fetchSearchResults = async (query: string) => {
    if (!query || !token) {
      setSearchResults([]);
      setSearchOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
      setSearchOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version to reduce API calls
  const debouncedSearch = debounce(fetchSearchResults, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "course") {
      router.push(`/admin/courses/${result.id}`);
    } else {
      router.push(`/admin/users/${result.id}`);
    }
    setSearchOpen(false);
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Left: Logo + Search + Nav */}
        <div className="d-flex align-items-center">
          <span
            className="navbar-brand text-primary fw-bold mb-0"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/admin/dashboard")}
          >
            E-Learning
          </span>

          {/* Search bar */}
          <div className="position-relative ms-3" style={{ minWidth: "250px" }} ref={searchRef}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search courses or users..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchOpen && (
              <div
                className="dropdown-menu show mt-1 p-2"
                style={{ width: "100%", maxHeight: "300px", overflowY: "auto" }}
              >
                {loading && <p className="dropdown-item text-muted">Loading...</p>}
                {!loading && searchResults.length === 0 && (
                  <p className="dropdown-item text-muted">No results found</p>
                )}
                {!loading && searchResults.map(result => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="dropdown-item text-truncate"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.name} {result.extra ? `(${result.extra})` : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation links */}
          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/admin/dashboard")}>Home</button>
          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/admin/courses")}>Courses</button>
          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/admin/users")}>Users</button>
          <button className="btn btn-link nav-link mx-2" onClick={() => router.push("/admin/analytics")}>Analytics</button>
        </div>

        {/* Right: Profile */}
        <div className="position-relative ms-3" ref={dropdownRef}>
          <img
            src="/profile.png"
            alt="Profile"
            className="rounded-circle"
            style={{ width: 36, height: 36, cursor: "pointer" }}
            onClick={() => setProfileOpen(!profileOpen)}
          />
          {profileOpen && (
            <div className="dropdown-menu dropdown-menu-end show mt-2 p-2" style={{ minWidth: "220px" }}>
              <div className="mb-2 border-bottom pb-2">
                <p className="mb-0"><strong>{name}</strong></p>
                <p className="mb-0 text-muted">{email}</p>
                <p className="mb-0 text-muted">ADMIN</p>
              </div>
              <button className="dropdown-item" onClick={() => router.push("/admin/profile/edit")}>
                Edit Profile
              </button>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
