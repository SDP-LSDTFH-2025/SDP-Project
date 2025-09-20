import React, { useState, useEffect } from "react";
import "./StudyPartnersPage.css";

const SearchIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const StudyPartners = () => {
  const [users, setUsers] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER ;
        const res = await fetch(`${SERVER}/api/v1/users`, {
          headers: { Accept: "application/json" },
        });
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.course && u.course.toLowerCase().includes(query.toLowerCase()))
  );

  const handleRequest = (id) => {
    setRequestedIds((prev) => new Set(prev).add(id));
  };

  return (
    <main className="study-partners">
      <header className="study-header">
        <h2>Study Partners</h2>
        <p>Find and connect with other students in your courses</p>
      </header>

      <section className="search-section">
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder="Search by username or course..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section className="cards">
        {filteredUsers.map((user) => {
          const isRequested = requestedIds.has(user.id);
          return (
            <article key={user.id} className="card">
              <header className="card-header">{user.username}</header>
              <p className="card-course">{user.course || "No course listed"}</p>
              <button
                className="connect-btn"
                onClick={() => handleRequest(user.id)}
                disabled={isRequested}
              >
                {isRequested ? "Requested" : "Connect"}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default StudyPartners;
