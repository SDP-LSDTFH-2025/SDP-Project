import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  UserPlus, 
  Users, 
  BookOpen, 
  BarChart3, 
  Clock,
  Filter,
  CircleCheckBig,
  Trash2,
  Bell
} from "lucide-react";
import "./Notifications.css";

function Notifications({ user }) {
  const initialNotifications = [
    {
      id: 1,
      type: "friend request",
      title: "New Friend Request",
      description: "Sarah Johnson wants to connect with you",
      time: "2 min ago",
      icon: UserPlus,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      action: true,
      unread: true
    },
    {
      id: 2,
      type: "study group",
      title: "Study Group Invite",
      description: "You've been invited to 'Biology Final Prep' group",
      time: "1 hour ago",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      action: true,
      unread: true
    },
    {
      id: 3,
      type: "resource",
      title: "New Resource Shared",
      description: "Alex shared 'Calculus Notes Chapter 5'",
      time: "3 hours ago",
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      unread: true
    },
    {
      id: 4,
      type: "general",
      title: "Weekly Summary",
      description: "Your study progress report is ready to view",
      time: "1 day ago",
      icon: BarChart3,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      unread: false
    },
    {
      id: 5,
      type: "reminder",
      title: "Study Session Reminder",
      description: "Chemistry group meeting starts in 30 minutes",
      time: "Just now",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      unread: true
    }
  ];

  const [notifications, setNotifications] = useState(initialNotifications);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
  };

  // Toggle show unread
  const handleToggleShowUnread = () => {
    setShowUnreadOnly(prev => !prev);
  };

  // Filter notifications based on showUnreadOnly
  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => n.unread)
    : notifications;

  const getTypeBadge = (type) => {
    const typeConfig = {
      "friend request": { label: "Friend Request", variant: "default" },
      "study group": { label: "Study Group", variant: "secondary" },
      "resource": { label: "Resource", variant: "outline" },
      "general": { label: "General", variant: "outline" },
      "reminder": { label: "Reminder", variant: "default" }
    };
    const config = typeConfig[type] || { label: type, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="notifications-page">
      <nav className="page-header">
        <h1 className="page-title">
          <Bell className="header-icon" />
          Notifications
        </h1>
        <div className="header-actions">
          <Button className="outline" onClick={handleToggleShowUnread}>
            <Filter className="pics"/>
            {showUnreadOnly ? "Show All" : "Show Unread"}
          </Button>
          <Button className="outline" onClick={handleMarkAllAsRead}>
            <CircleCheckBig className="pics"/>
            Mark all as read
          </Button>
          <Button className="outline" onClick={() => setNotifications([])}>
            <Trash2 className="pics"/>
            Clear All
          </Button>
        </div>
      </nav>

      <main className="notifications-container">
        {filteredNotifications.length === 0 && showUnreadOnly ? (
          <div className="no-unread-notifications">
            <Bell size={70}/>
            <h3>No unread notifications</h3>
            <p>You're all caught up! No new notifications to review.</p>
            <Button className="outline" onClick={() => setShowUnreadOnly(false)}>
              Show all notifications
            </Button>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`notification-card ${notification.unread ? 'unread' : ''}`}
            >
              <CardContent className="notification-content">
                <div className="notification-icon">
                  <div className={`icon-container ${notification.bgColor}`}>
                    <notification.icon className={notification.color} />
                  </div>
                </div>
                
                <div className="notification-details">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p className="notification-description">{notification.description}</p>
                  {getTypeBadge(notification.type)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

export default Notifications;
