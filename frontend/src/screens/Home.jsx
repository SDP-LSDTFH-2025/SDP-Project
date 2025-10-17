import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; 
import { getAllFriends } from "../api/resources";
import { getGroups } from "../api/groups";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Users,
  BookOpen,
  MessageSquare,
  UserPlus,
  Upload,
  Calendar,
  Heart,
  Share2,
  MessageCircle,
  Filter,
  Bell,
  Menu,
  Settings,
  User,
  X,
  LogOut,
  ChartSpline,
} from "lucide-react";
import { DragAndDropArea } from "./DragAndDrop.jsx";
import FriendList from "./FriendList.jsx";
import Profiles from "../pages/Profiles.jsx";
import Friends from "../pages/Friends.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import "./Home.css";

import ProfilePage from "../pages/ProfilePage.jsx";
import Feed from "../pages/Feed.jsx";
import PlanSessions from "../pages/Sessions.jsx";
import Progress from "../pages/Progress.jsx";

function Home({ user }) {
  const [activeView, setActiveView] = useState("feed");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [groupList, setGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [events, setEvents] = useState([]);

  const calendar_token = localStorage.getItem("calendar_token");

  const {
    data: rawFriends = [],
    isLoading: friendsLoading,
    error: friendsError,
  } = useQuery({
    enabled: !!user?.id,
    queryKey: ["friends"],
    queryFn: getAllFriends,
    staleTime: 20 * 60 * 1000,
    cacheTime: 25 * 60 * 1000,
  });

  const { data: rawGroups = [],
    isLoading: groupsLoading,
    error: groupsError, 
  } = useQuery({
    enabled: !!user?.id,
    queryKey: ["groups"],
    queryFn: getGroups,
    staleTime: 15 * 60 * 1000,
    cacheTime: 17 * 60 * 1000,
  });

  const friends = rawFriends.slice(0, 4).map((u) => ({
    id: u.id,
    username: u.username,
    name: u.username.replaceAll("_", " "),
    is_active: u.is_active,
    course: u.course || "",
    status: u.is_active ? "Active" : "Inactive",
  }));

  const groups = rawGroups
  .filter((group) => group.joined) // only groups you joined
  .slice(0, 4);

  useEffect(() => {
    const isValid =
      title.trim() !== "" &&
      courseId.trim() !== "" &&
      description.trim() !== "" &&
      (pdfFile || pictureFile);
    setIsFormValid(isValid);
  }, [title, courseId, description, pdfFile, pictureFile]);

  useEffect(() => {
    async function fetchEvents() {
      if (!calendar_token) return;
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${calendar_token}` },
        }
      );
      const data = await res.json();
      if (data.items) {
        setEvents(
          data.items.map((ev) => ({
            title: ev.summary,
            start: ev.start.dateTime || ev.start.date,
            end: ev.end.dateTime || ev.end.date,
          }))
        );
      }
    }

    fetchEvents();
  }, [calendar_token]);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  }

  function handleNavigationClick(view) {
    setActiveView(view);
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !courseId || !description || (!pdfFile && !pictureFile)) {
      setError("Please fill in all required fields and select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user?.id || "test-user");
    formData.append("course_code", courseId);
    formData.append("title", title);
    formData.append("description", description);
    if (pictureFile) {
      formData.append("image", pictureFile);
    }
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    try {
      const SERVER = import.meta.env.MODE === "development" ? import.meta.env.VITE_DEV_SERVER || "http://localhost:3000" : import.meta.env.VITE_PROD_SERVER;

      const url = pdfFile
        ? `${SERVER}/api/v1/upload/pdf`
        : `${SERVER}/api/v1/upload/picture`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTitle("");
        setCourseId("");
        setDescription("");
        setPdfFile(null);
        setPictureFile(null);
        setActiveView("feed");
        alert("Resource uploaded successfully!");
      } else {
        const errorMessage =
          data.message || `Upload failed with status ${response.status}`;
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet or server URL."
          : error.message || "An unexpected error occurred.";
      setError(errorMessage);
    }
  };

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="navigation">
        <h1 className="logo">StudyBuddy</h1>

        <div className="nav-actions">
          <Link to="/messages">
            <Button className="nav-button">
              <MessageCircle className="pics" />
            </Button>
          </Link>
          <Link to="/notifications">
            <Button className="nav-button">
              <Bell className="pics" />
            </Button>
          </Link>
          <Button
            className={`nav-button ${activeView === "profile" ? "active" : ""}`}
            onClick={() => handleNavigationClick("profile")}
          >
            <User className="pics" />
          </Button>
          <button className="nav-btn logout" onClick={logout}>
            Logout
          </button>
          <button className="nav-btn menu-btn mobile-only" onClick={toggleMenu}>
            {isMenuOpen ? <X className="pics" size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Button
                className={`buttons ${activeView === "feed" ? "active" : ""}`}
                onClick={() => {
                  handleNavigationClick("feed");
                  toggleMenu();
                }}
              >
                <BookOpen className="pics" /> Resource Feed
              </Button>
            </li>
            <li>
              <Button
                className={`buttons ${
                  activeView === "groups" ? "active" : ""
                }`}
                onClick={() => {
                  handleNavigationClick("groups");
                  toggleMenu();
                }}
              >
                <Users className="pics" /> Study Groups
              </Button>
            </li>
            <li>
              <Button
                className={`buttons ${
                  activeView === "friends" ? "active" : ""
                }`}
                onClick={() => handleNavigationClick("friends")}
              >
                <User className="pics" />
                Study Buddies
              </Button>
            </li>
            <li>
              <Button
                className={`buttons ${
                  activeView === "requests" ? "active" : ""
                }`}
                onClick={() => {
                  handleNavigationClick("requests");
                  toggleMenu();
                }}
              >
                <UserPlus className="pics" /> Friend Requests
              </Button>
            </li>
            <li>
              <Button
                className={`buttons ${
                  activeView === "upload" ? "active" : ""
                }`}
                onClick={() => {
                  handleNavigationClick("upload");
                  toggleMenu();
                }}
              >
                <Upload className="pics" /> Upload Resource
              </Button>
            </li>
            <li>
              <Button
                className="buttons"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="pics" />
                Logout
              </Button>
            </li>
          </ul>
        </div>
      )}

      <main className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="navigate">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="title">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className={`buttons ${activeView === "feed" ? "active" : ""}`}
                  onClick={() => handleNavigationClick("feed")}
                >
                  <BookOpen className="pics" />
                  Resource Feed
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "progress" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("progress")}
                >
                  <ChartSpline className="pics" />
                  Progress
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "friends" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("friends")}
                >
                  <User className="pics" />
                  Study Buddies
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "requests" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("requests")}
                >
                  <UserPlus className="pics" />
                  Friend Requests
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "groups" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("groups")}
                >
                  <Users className="pics" />
                  Study Groups
                </Button>


                <Button
                  className={`buttons ${
                    activeView === "upload" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("upload")}
                >
                  <Upload className="pics" />
                  Upload Resource
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="calender">
            <Card className="shadow-card">
              <CardHeader className="calendar-header">
                <div className="header-content">
                  <Calendar className="pics" />
                  <CardTitle className="title">Upcoming Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="calendar-preview">
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={false}
                  height="320px"
                  aspectRatio={1.2}
                  dayMaxEvents={true}
                  dayHeaderFormat={{ weekday: "short" }}
                  dayHeaders={true}
                  dayHeaderContent={(arg) => {
                    const dayChars = ["S", "M", "T", "W", "T", "F", "S"];
                    return dayChars[arg.dow];
                  }}
                  eventContent={() => {
                    return { html: `<div class="event-dot"></div>` };
                  }}
                  events={events}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    setSelectedEvent({
                      title: info.event.title,
                      start: info.event.start,
                      end: info.event.end,
                      color: info.event.backgroundColor,
                    });
                  }}
                />
                {selectedEvent && (
                  <div className="event-modal">
                    <div className="event-modal-content">
                      <h3 style={{ color: "#0000ff" }}>
                        {selectedEvent.title}
                      </h3>
                      <p>
                        Date: {selectedEvent.start.toLocaleDateString()} <br />
                        Time: {selectedEvent.start.toLocaleTimeString()} <br />
                      </p>
                      <button
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          borderRadius: "0.5rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          border: "none",
                          background: "#6366f1",
                          color: "white",
                        }}
                        onClick={() => setSelectedEvent(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Resource feed / Upload section */}
        <section className="resources">
          <div className="col-span-6">
            {activeView === "feed" && (
              <div className="share-card">
                <h2>Resources</h2>
                <Button
                  className="upload-btn"
                  onClick={() => setActiveView("upload")}
                >
                  <Share2 className="pics" /> Share
                </Button>

                <Feed />
              </div>
            )}
            {activeView === "requests" && (
              <FriendList
                handleNavigationClick={handleNavigationClick}
                setSelectedUser={setSelectedUser}
              />
            )}
            {activeView === "upload" && (
              <div id="Uploads" className="share-card">
                <h2>Upload Study Resource</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleUploadSubmit}>
                  <Input
                    className="search"
                    placeholder="Resource title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <Input
                    className="search"
                    placeholder="Course Code"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                  />
                  <Input
                    className="search"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <DragAndDropArea
                    onFilesSelected={(files) => {
                      const pdf = files.find((f) => f.type.includes("pdf"));
                      const image = files.find((f) =>
                        f.type.startsWith("image/")
                      );
                      if (pdf) setPdfFile(pdf);
                      if (image) setPictureFile(image);
                    }}
                  />
                  <Button
                    type="submit"
                    className={`w-full p-2 rounded upload-btn ${
                      isFormValid
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isFormValid}
                  >
                    Submit Upload
                  </Button>
                </form>
              </div>
            )}
            {activeView === "profile" && <ProfilePage />}
            {activeView === "progress" && (
              <div className="share-card">
                <Progress />
              </div>
            )}
            {activeView === "usersprof" && <Profiles user={selectedUser} />}

            {activeView === "friends" && (
              <div className="share-card">
                <Friends
                  handleNavigationClick={handleNavigationClick}
                  setSelectedUser={setSelectedUser}
                />
              </div>
            )}

            {activeView === "groups" && (
              <div className="share-card">
                <PlanSessions />
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="rightbar">
          <div className="study-buddies">
            <h3 className="buddies">
              <MessageSquare className="pics" />
              Study Buddies
            </h3>
            {friendsLoading && <p>Loading friends...</p>}
            {friendsError && <p style={{ color: "red" }}>{friendsError.message}</p>}
            {friends.length > 0 ? (
              friends.map((f, i) => (
                <Link
                  key={i}
                  to="/messages"
                  state={{ chat: f }}
                  className="buddy-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="avatar">
                    {f.username
                      ?.split("_")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="buddy-info">
                    <strong className="buddy-name">{f.name}</strong>
                    <div className="buddy-course">{f.course}</div>
                    <div className="buddy-status">
                      <span>{f.status}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              !friendsLoading && <p className="empty-text">No friends yet.</p>
            )}
          </div>

          {/* Active study groups */}
          <div className="study-groups">
            <h3> <Users className="pics" /> Group Studies</h3>
            {groupsLoading && <p>Loading Groups...</p>}
            {groupsError && <p >{groupsError.message}</p>}
            {groups.length > 0 ? (
              groups.map((f, i) => (
                <div key={i} className="buddy-item">
                  <div className="avatar" >
                    {f.title
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="buddy-info">
                    <strong className="buddy-name">{f.title}</strong>
                    <div className="buddy-course">{f.subject}</div>
                  </div>
                </div>
              ))
              ) : (
                <p className="empty-text">No groups yet.</p>
                )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Home;
