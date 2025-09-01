import React, { useMemo, useState } from "react";
import { Search, Users as UsersIcon } from "lucide-react";
import "./studybuddy.css"; // import the CSS file

const studentsData = [];

function StudentCard({ student }) {
  const initials = useMemo(
    () =>
      student.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase(),
    [student.name]
  );

  return (
    <article className="student-card">
      <div className="student-header">
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="student-avatar" />
        ) : (
          <div className="student-avatar">{initials}</div>
        )}

        <div className="student-info">
          <h3>{student.name}</h3>
          <p>{student.major}</p>
          <p>{student.year}</p>
          <div className="student-connections">
            <UsersIcon className="h-4 w-4" />
            <span>{student.connections} connections</span>
          </div>
        </div>
      </div>

      <p className="student-bio">{student.bio}</p>

      <div className="courses">
        <p>Courses:</p>
        <div className="course-tags">
          {student.courses.map((course, idx) => (
            <span key={idx} className="course-tag">
              {course}
            </span>
          ))}
        </div>
      </div>

      <div className="student-actions">
        <button className="btn btn-outline">View Profile</button>
        <button className="btn btn-black">
          <UsersIcon className="h-4 w-4" style={{ marginRight: "0.5rem" }} />
          Connect
        </button>
      </div>
    </article>
  );
}

export default function StudyPartnersPage() {
  const [query, setQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return studentsData;

    return studentsData.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.major.toLowerCase().includes(q) ||
        s.courses.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <main>
      <div className="container">
        <header>
          <h1>Study Partners</h1>
          <p>Find and connect with other students in your courses</p>
        </header>

        {/* Search Section */}
        <section className="search-box">
          <div className="search-input-wrapper">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, major, or courses..."
              className="search-input"
            />
          </div>
        </section>

        {/* Students Grid */}
        <section>
          <div className="students-grid">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="empty-state">
              <p>No students found matching your search.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
