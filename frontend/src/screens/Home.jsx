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

	Settings,
  User
  } from "lucide-react";
import {DragAndDropArea} from "./DragAndDrop.jsx";
import FriendList from "./FriendList.jsx";
import "./Home.css";
{/*installed:
  1.npm install lucide-react (svg)*/ }
function Home({ user }) {
  const [activeView, setActiveView] = useState("feed");
  const fileInputRef = useRef(null); 


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Error in component:", error.message);
      }
    };
    fetchUsers();
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const friends = user?.friends || [];
  const groups = user?.groups || [];
  const resources = user?.resources || [];

  const handleNavigationClick = (view) => { 
    setActiveView(view); 
  };
  
  
  
  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="navigation">
        <h1 className="logo">StudyBuddy</h1>
        <Input className="search" placeholder="Search resources,friends,cources..."></Input>
        <div className="nav-actions">
        <Link to="/messages">
          <Button className="nav-button">
            <MessageCircle className="pics" />
          </Button>
        </Link>
          <Button className="nav-button">
            <Bell className="pics"></Bell>
          </Button>
          <Link to="/profile">
          <Button className="nav-button">
            <User className="pics"></User>
          </Button>
          </Link>
          <button className="nav-btn logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="navigate">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="title">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className={`buttons ${activeView === "feed" ? "active" : ""}`} 
                  onClick={() => handleNavigationClick("feed")}>
                  <BookOpen className="pics" />
                  Resource Feed
                </Button>
                <Button className={`buttons ${activeView === "studyGroup" ? "active" : ""}`} 
                  onClick={() => handleNavigationClick("studyGroup")}>
                  <Users className="pics" />
                  Study Groups
                </Button>
                <Button className={`buttons ${activeView === "requests" ? "active" : ""}`} 
                  onClick={() => handleNavigationClick("requests")}>
                  <UserPlus className="pics" />
                  Friend Requests
                </Button>
                <Button className={`buttons ${activeView === "upload" ? "active" : ""}`} 
                  onClick={() => handleNavigationClick("upload")}>
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
                  <Filter className="pics"/>
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
                  <Input className="search" placeholder="Enter school name"  />
                </div>
                <div className="filter-badges">
                  <Badge className="badges" variant="outline">Mathematics</Badge>
                  <Badge className="badges" variant="outline">Chemistry</Badge>
                  <Badge className="badges" variant="outline">Physics</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
        
        {/* Resource feed (center) */}
        <section className="resources">
          <div className="col-span-6"> 
            {activeView === "feed" && ( 
              <div className="share-card"> 
                <h2>Share a thought...</h2> 
                <Input className="search" placeholder="What would you like to share with your buddies?" />
                <Button className="upload-btn" > 
                  <Share2 className="pics" />Share
                </Button> 
              </div> 
            )} 
            
            {activeView === "studyGroup" && ( 
              <div id="StudyGroup" className="share-card"> 
                <h2><Users className="pics" />Study Groups</h2> 
              </div> 
            )}
            
            {activeView === "requests" && ( 
              <div id="Request" > 
                <FriendList/>
              </div> 
            )}
            
            {activeView === "upload" && ( 
              <div id="Uploads" className="share-card"> 
                <h2>Upload Study Resource</h2> 
                <Input className="search" placeholder="Resource title" /> 
                <Input className="search" placeholder="Course Code" /> 
                <Input className="search" placeholder="Description" /> 
                <DragAndDropArea onFilesSelected={(files) => { 
                  console.log('Files ready for upload:', files); 
                }} /> 
              </div> 
            )}
          </div> 
        </section>
        
        {/* Right Sidebar */}
        <aside className="rightbar">
          <div className="study-buddies">
            <h3 className="buddies">
              <MessageSquare className="pics"/>
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