import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bell, Settings, User } from "lucide-react";
import './navigation.css';

function Navigation({ logout }){
  return (
    <nav className="navigation">
      <h1 className="logo">StudyBuddy</h1>
      <Input
        className="search"
        placeholder="Search resources, friends, courses..."
      />
      <div className="nav-actions">
        <Button className="nav-button prof">
          <Bell className="pics prof" />
        </Button>
        <Button className="nav-button prof">
          <Settings className="pics prof" />
        </Button>
        <Button className="nav-button prof">
          <User className="pics prof" />
        </Button>
        <button className="nav-btn logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;