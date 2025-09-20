import React, { useEffect,useState,useRef } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../functions/users";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Badge} from "../components/ui/badge";
import { 
	Search, 
	Users, 
	BookOpen, 
	MessageSquare, 
	UserPlus, 
	Upload,
	Heart,
	Share2,
	MessageCircle,
	Filter,
	Bell,
  Menu,
	Settings,
  User,
  X,
  LogOut 
  } from "lucide-react";
import {DragAndDropArea} from "./DragAndDrop.jsx";
import FriendList from "./FriendList.jsx";
import "./Home.css";

import StudyPartnersPage from "../pages/StudyPartnersPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import Feed from "../pages/Feed.jsx";

function Home({ user }) {
  
  const [activeView, setActiveView] = useState("feed");
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [error, setError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

 const [friendsList, setFriends] = useState([]);
 const [groupList, setGroups] = useState([]);
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  // Validate form whenever inputs change
  useEffect(() => {
    const isValid = title.trim() !== '' && 
                    courseId.trim() !== '' && 
                    description.trim() !== '' && 
                    (pdfFile || pictureFile);
    setIsFormValid(isValid);
  }, [title, courseId, description, pdfFile, pictureFile]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const friendsArray = data.map(user => ({
          name: user.username, // Rename 'username' to 'name'
          status: user.is_active ? 'Active' : 'Inactive', // Rename 'is_active' to 'status' and convert to string
        }));
        setFriends(friendsArray);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching users:", error.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getAllGroups();
        const groupsArray = data.map(group => ({
          name: group.name, 
          online: Math.random() < 0.5 ? 'Online' : 'Offline',
        }));
        setGroups(groupsArray);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching groups:", error.message);
      }
    };
    fetchGroups();
  }, []);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  }

  const friends = friendsList || user?.friends || [];
  const groups = groupList || user?.groups || [];

  function handleNavigationClick(view) {
    setActiveView(view);
  }

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setActiveView("upload");
      const pdf = Array.from(files).find((f) => f.type.includes("pdf"));
      const image = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (pdf) setPdfFile(pdf);
      if (image) setPictureFile(image);
      console.log("Files selected:", { pdf, image });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!title || !courseId || !description || (!pdfFile && !pictureFile)) {
      setError("Please fill in all required fields and select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user?.id || "test-user"); // Replace with actual user ID
    formData.append("course_code", courseId);
    formData.append("title", title);
    formData.append("description", description);
      if (pictureFile) {
        formData.append("image", pictureFile);
      }
    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }
    // Log FormData contents for debugging
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    console.log(user);
    
    try {
      const SERVER =
        import.meta.env.VITE_PROD_SERVER ||
        import.meta.env.VITE_DEV_SERVER ||
        "http://localhost:3000";
      
      const url = pdfFile ? `${SERVER}/api/v1/upload/pdf` : `${SERVER}/api/v1/upload/picture`; // Verify this endpoint
    
      console.log("Request URL:", url);
      console.log("FormData:", formData);
      const response = await fetch(url, {
        method: "POST",
        body: formData, // No Content-Type header for FormData
      });

      const data = await response.json();
      console.log("API Response:", data, "Status:", response.status);

      if (response.ok) {
        console.log("Upload successful!");
        setTitle("");
        setCourseId("");
        setDescription("");
        setPdfFile(null);
        setPictureFile(null);
        setActiveView("feed");
        alert("Resource uploaded successfully!"); // Replace with toast
      } else {
        const errorMessage =
          data.message || `Upload failed with status ${response.status}`;
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error, error.stack);
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
          <Input
            className="search"
            placeholder="Search resources, friends, courses..."
            
          />
        <div className="nav-actions">
          <Link to="/messages">
            <Button className="nav-button">
              <MessageCircle className="pics" />
            </Button>
          </Link>
          <Button className="nav-button">
            <Bell className="pics" />
          </Button>
          <Button className={`nav-button ${activeView === "profile" ? "active" : ""}`} onClick={() => handleNavigationClick("profile")}>
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
      {isMenuOpen && (
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Button 
              className={`buttons ${activeView === "feed" ? "active" : ""}`}
              onClick={() => { handleNavigationClick("feed"); toggleMenu(); }}
            >
              <BookOpen className="pics" /> Resource Feed
            </Button>
          </li>
          <li>
            <Button 
              className={`buttons ${activeView === "groups" ? "active" : ""}`}
              onClick={() => { handleNavigationClick("groups"); toggleMenu(); }}
            >
              <Users className="pics" /> Study Groups
            </Button>
          </li>
          <li>
            <Button 
              className={`buttons ${activeView === "requests" ? "active" : ""}`}
              onClick={() => { handleNavigationClick("requests"); toggleMenu(); }}
            >
              <UserPlus className="pics" /> Friend Requests
            </Button>
          </li>
          <li>
            <Button 
              className={`buttons ${activeView === "upload" ? "active" : ""}`}
              onClick={() => { handleNavigationClick("upload"); toggleMenu(); }}
            >
              <Upload className="pics" /> Upload Resource
            </Button>
          </li>
          <li>
          <Button 
            className="buttons" 
            onClick={() => { logout(); setIsMenuOpen(false); }}
          >
             <LogOut className="pics"/>Logout
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
                  className={`buttons ${activeView === "groups" ? "active" : ""}`}
                  onClick={() => handleNavigationClick("groups")}
                >
                  <Users className="pics" />
                  Study Groups
                </Button>
                <Button 
                  className={`buttons ${activeView === "requests" ? "active" : ""}`}
                  onClick={() => handleNavigationClick("requests")}
                  >
                  <UserPlus className="pics" />
                  Friend Requests
                </Button>
                <Button
                  className={`buttons ${activeView === "upload" ? "active" : ""}`}
                  onClick={() => handleNavigationClick("upload")}
                >
                  <Upload className="pics" />
                  Upload Resource
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="filtersearch">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="title">
                  <Filter className="pics" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="filters">Course</label>
                  <Input className="search" placeholder="Enter course code" />
                </div>
                <div>
                  <label className="filters">School</label>
                  <Input className="search" placeholder="Enter school name" />
                </div>
                <div className="filter-badges">
                  <Badge className="badges" variant="outline">
                    Mathematics
                  </Badge>
                  <Badge className="badges" variant="outline">
                    Chemistry
                  </Badge>
                  <Badge className="badges" variant="outline">
                    Physics
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Resource feed / Upload section */}
        <section className="resources">
          <div className="col-span-6">

            {activeView === "feed" && (
              <div className="share-card">
                <h2>Share a Thought...</h2>
                <Input
                  className="search"
                  placeholder="What would you like to share with your buddies?"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden-file-input"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
                />
                <Button className="upload-btn" onClick={() => setActiveView("upload")}>
                  <Share2 className="pics" /> Share
                </Button>

                <Feed />

              </div>
            )}
            {activeView === "requests" && ( 
              <div id="Request"> 
                <FriendList/>
              </div> 
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
                      console.log("Files ready for upload:", files);
                      const pdf = files.find((f) => f.type.includes("pdf"));
                      const image = files.find((f) => f.type.startsWith("image/"));
                      if (pdf) setPdfFile(pdf);
                      if (image) setPictureFile(image);
                    }}
                  />              
                  <Button type="submit" className={`w-full p-2 rounded upload-btn ${isFormValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!isFormValid}>
                    Submit Upload
                  </Button>
                </form>
              </div>
            )}


            {activeView === "profile" && <ProfilePage />}

            {activeView === "groups" && (
              <div className="share-card">
                <h2>Groups Section to be implemented...</h2>
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
            {friends.length > 0 ? (
              friends.map((f, i) => (
                <p key={i}>
                  {f.name} – {f.status}
                </p>
              ))
            ) : (
              <p className="empty-text">No friends yet.</p>
            )}
          </div>


				{/* Active study groups */}
				<div className="study-groups">
					<h3>Active Study Groups</h3>
					{groups.length > 0 ? (
						groups.map((g, i) => (
							<p key={i}>
								{g.name} ({g.online} online)
							</p>
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