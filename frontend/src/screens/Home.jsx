import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; 
import { getAllFriends } from "../api/resources";
import { showSuccess, showError } from "../utils/toast"; 
import { getGroups, getStudySessions } from "../api/groups";
import { getUnreadNotificationCount } from "../api/notifications";

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
import Notifications from "./Notifications.jsx";
import CallIndicator from "../components/CallIndicator.jsx";

function Home({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the current view from URL hash or default to "feed"
  const getCurrentView = () => {
    const hash = location.hash.replace('#', '');
    const validViews = ['feed', 'calendar', 'messages', 'friends', 'profile', 'sessions', 'progress', 'notifications', 'upload', 'requests', 'groups', 'usersprof'];
    return validViews.includes(hash) ? hash : 'feed';
  };
  
  const [activeView, setActiveView] = useState(getCurrentView());
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);

  // Sync URL with activeView state
  useEffect(() => {
    const currentView = getCurrentView();
    setActiveView(currentView);
  }, [location.hash]);

  // Update URL when activeView changes
  const updateActiveView = (view) => {
    setActiveView(view);
    navigate(`/home#${view}`, { replace: true });
  };
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [groupList, setGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [events, setEvents] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

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

  const {
    data: notificationCountData,
    isLoading: notificationCountLoading,
  } = useQuery({
    enabled: !!user?.id,
    queryKey: ["notificationCount"],
    queryFn: () => getUnreadNotificationCount(user.id),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  const {
    data: studySessionsData,
    isLoading: studySessionsLoading,
  } = useQuery({
    enabled: !!user?.id,
    queryKey: ["studySessions", user.id],
    queryFn: () => getStudySessions(user.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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

  // Listen for navigation to messages from other components
  useEffect(() => {
    const handleNavigateToMessages = () => {
      handleNavigationClick("messages");
    };

    window.addEventListener('navigateToMessages', handleNavigateToMessages);
    
    return () => {
      window.removeEventListener('navigateToMessages', handleNavigateToMessages);
    };
  }, []);

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
            color: '#10b981', // Green color for Google Calendar events
            extendedProps: {
              type: 'google_calendar'
            }
          }))
        );
      }
    }

    fetchEvents();
  }, [calendar_token]);

  // Update study sessions when data changes
  useEffect(() => {
    if (studySessionsData?.success && studySessionsData.sessions) {
      setStudySessions(studySessionsData.sessions);
    }
  }, [studySessionsData]);

  // Update notification count when data changes
  useEffect(() => {
    if (notificationCountData?.success && typeof notificationCountData.data === 'number') {
      setNotificationCount(notificationCountData.data);
    }
  }, [notificationCountData]);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  }

  function handleNavigationClick(view) {
    if (view === "messages") {
      navigate("/messages");
    } else {
      updateActiveView(view);
    }
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
        updateActiveView("feed");
        showSuccess("Resource uploaded successfully!");
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

  //settings ui
  const [Configurations, toogleConfigurations] = useState(false);
  

  useEffect(()=>{
      //add all affected elements here
    const modules = [
      document.documentElement,
      document.querySelector(".dashboard"),//
      document.querySelector(".navigation"),
      document.querySelector(".logo"),
      ...document.querySelectorAll(".title"),
      document.querySelector(".header-content"),
      document.querySelector(".nav-btn"),
      document.querySelector(".sidebar"),
      document.querySelector(".rightbar"),
      ...document.querySelectorAll(".buddies"),
      ...document.querySelectorAll(".buddy-name"),
      document.querySelector(".share-card"),
      document.querySelector(".study-buddies"),
      document.querySelector(".sidebar"),
      document.querySelector(".search"),
      document.querySelector(".share-input"),
      document.querySelector(".resource-card"),
      document.querySelector(".buddy-item"),
      ...document.querySelectorAll(".darkText"),
      document.querySelector(".event-modal-content"),
      document.querySelector(".mobile-menu"),
      //document.querySelector(".logout"),
    ];

    if (Configurations){
      for (const element of modules){
        if (!element) continue;
        element.classList.add("dark-mode");
      }
    }
    else{
      for (const element of modules){
        if (!element) continue;
        element.classList.remove("dark-mode");
      }
    }
  },[Configurations])

  return (
    <div className="home-container">
      {/* Call Indicator - shows incoming/active calls */}
      <CallIndicator />
      
      {/* Top Navigation Bar */}
      <nav className="navigation">
        <h1 className="logo">StudyBuddy</h1>

        <div className="nav-actions">
          <Button
            className={`nav-button ${activeView === "messages" ? "active" : ""}`}
            onClick={() => handleNavigationClick("messages")}
          >
            <MessageCircle className="pics" />
          </Button>
          <Button
            className={`nav-button ${activeView === "notifications" ? "active" : ""}`}
            onClick={() => handleNavigationClick("notifications")}
            style={{ position: 'relative' }}
          >
            <Bell className="pics" />
            {notificationCount > 0 && (
              <Badge 
                className="notification-badge"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid white'
                }}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>
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
          <button className="nav-btn logout" onClick={()=>toogleConfigurations(!Configurations)}>{Configurations ? "🌞 Light Mode" : "🌙 Dark Mode"}</button>
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
                className={`buttons ${
                  activeView === "messages" ? "active" : ""
                }`}
                onClick={() => {
                  handleNavigationClick("messages");
                  toggleMenu();
                }}
              >
                <MessageCircle className="pics" /> Messages
              </Button>
            </li>
            <li>
              <Button
                className={`buttons ${
                  activeView === "notifications" ? "active" : ""
                }`}
                onClick={() => {
                  handleNavigationClick("notifications");
                  toggleMenu();
                }}
                style={{ position: 'relative' }}
              >
                <Bell className="pics" /> Notifications
                {notificationCount > 0 && (
                  <Badge 
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: '1px solid white'
                    }}
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
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
                  <BookOpen className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Resource Feed
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "progress" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("progress")}
                >
                  <ChartSpline className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Progress
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "friends" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("friends")}
                >
                  <User className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Study Buddies
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "requests" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("requests")}
                >
                  <UserPlus className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Friend Requests
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "groups" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("groups")}
                >
                  <Users className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Study Groups
                </Button>


                <Button
                  className={`buttons ${
                    activeView === "upload" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("upload")}
                >
                  <Upload className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Upload Resource
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "messages" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("messages")}
                >
                  <MessageCircle className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Messages
                </Button>

                <Button
                  className={`buttons ${
                    activeView === "notifications" ? "active" : ""
                  }`}
                  onClick={() => handleNavigationClick("notifications")}
                  style={{ position: 'relative' }}
                >
                  <Bell className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/>
                  Notifications
                  {notificationCount > 0 && (
                    <Badge 
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        border: '1px solid white'
                      }}
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="calender">
            <Card className="shadow-card">
              <CardHeader className="calendar-header">
                <div className="header-content">
                  <Calendar className="pics" style={{ color: Configurations ? "rgba(255, 255, 255, 1)" : "black" }}/>
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
                  events={[...events, ...studySessions]}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    const eventType = info.event.extendedProps?.type || 'unknown';
                    setSelectedEvent({
                      title: info.event.title,
                      start: info.event.start,
                      end: info.event.end,
                      color: info.event.backgroundColor,
                      type: eventType,
                      location: info.event.extendedProps?.venue || info.event.extendedProps?.location,
                      venue: info.event.extendedProps?.venue
                    });
                  }}
                />
                {selectedEvent && (
                  <div className="event-modal">
                    <div className="event-modal-content">
                      <h3 style={{ color: selectedEvent.type === 'study_session' ? "#3b82f6" : "#10b981" }}>
                        {selectedEvent.title}
                      </h3>
                      <p>
                        <strong>Type:</strong> {selectedEvent.type === 'study_session' ? 'Study Session' : 'Google Calendar Event'} <br />
                        <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()} <br />
                        <strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} - {selectedEvent.end.toLocaleTimeString()} <br />
                        {selectedEvent.venue && (
                          <>
                            <strong>Venue:</strong> {selectedEvent.venue} <br />
                          </>
                        )}
                        {selectedEvent.location && !selectedEvent.venue && (
                          <>
                            <strong>Location:</strong> {selectedEvent.location} <br />
                          </>
                        )}
                      </p>
                      <button
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          borderRadius: "0.5rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          border: "none",
                          background: selectedEvent.type === 'study_session' ? "#3b82f6" : "#10b981",
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
                <h2 className="darkText">Resources</h2>
                <Button
                  className="upload-btn"
                  onClick={() => updateActiveView("upload")}
                >
                  <Share2 className="pics" /> Upload Resource
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
                <h2 className="darkText">Upload Study Resource</h2>
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
            {activeView === "usersprof" && <Profiles user={selectedUser} currentUser={user} />}

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

            {activeView === "messages" && (
              <div className="share-card">
                <h2 className="darkText">Messages</h2>
                <Message />
              </div>
            )}

            {activeView === "notifications" && (
              <div className="share-card">
                <h2 className="darkText">Notifications</h2>
                <Notifications user={user} />
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
                <div
                  key={i}
                  className="buddy-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleNavigationClick("messages");
                    // Store the selected chat in localStorage for the Message component to use
                    localStorage.setItem("selectedChat", JSON.stringify(f));
                  }}
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
                </div>
              ))
            ) : (
              !friendsLoading && <p className="empty-text">No friends yet.</p>
            )}
          </div>

          {/* Active study groups */}
          <div className="study-groups">
            <h3 className="buddy-name"> <Users className="pics" style={{ color: Configurations ? "rgb(120, 0, 190)" : "black" }}/> Group Studies</h3>
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
