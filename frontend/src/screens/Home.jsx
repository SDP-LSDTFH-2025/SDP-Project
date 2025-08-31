import React, { useEffect } from "react";
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
	Settings
  } from "lucide-react";
import "./Home.css";

function Home({ user }) {
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

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="navigation">
	  
        <h1 className="logo">StudyBuddy</h1>
			
				<Input className="search" placeholder="Search resources,friends,cources..."></Input>
			
        <div className="nav-actions">
		  <Button className="nav-button">
			<Bell className="pics"></Bell>
		  </Button>
		  <Button className="nav-button">
			<Settings className="pics"></Settings>
		  </Button>
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
				<Button className="buttons">
					<BookOpen className="pics" />
						Resource Feed
				</Button>
				<Button className="buttons">
					<Users className="pics" />
						Study Groups
				</Button>
				<Button className="buttons">
					<UserPlus className="pics" />
						Friend Requests
				</Button>
				<Button className="buttons">
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
					<div >
					<label className="filters">Course</label>
					<Input className="search" placeholder="Enter course code" />
					</div>
					<div>
					<label className="filters">School</label>
					<Input className="search" placeholder="Enter school name"  />
					</div>
					<div >
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
          
          {/* Share a Resource card */}
          <div className="share-card">
            <h2>Share a Resource</h2>
            <Input className="search" placeholder="What would you like to share with your buddies?" />
            <Button className="upload-btn">
				<Upload className="pics" />
					Upload
			</Button>
          </div>

          {/* Posted resources */}
          <div className="resource-feed">
            {resources.length > 0 ? (
              resources.map((res, i) => (
                <div key={i} className="resource-card">
                  <h3>{res.title}</h3>
                  <p>{res.description}</p>
                </div>
              ))
            ) : (
              <p className="empty-text">Connect with friends and share resources.</p>
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
