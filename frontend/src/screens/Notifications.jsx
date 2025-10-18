import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  UserPlus, Users, BookOpen, BarChart3, Clock,
  Filter, CircleCheckBig, Trash2, Bell
} from "lucide-react";
import "./Notifications.css";
import { getNotifications, markAllNotificationsAsRead  } from "../api/notifications";

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  if (!user){
    user = JSON.parse(localStorage.getItem("user"));
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(user.id);
      if (data.success && Array.isArray(data.data)) {
        // Map API data to your UI format
        const formatted = data.data.map(n => ({
          id: n.id,
          title: n.title,
          description: n.message,
          time: new Date(n.created_at).toLocaleString(),
          unread: !n.read
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }; 

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead(user.id);
      if (response.success) {
        // Update the local state
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        // Invalidate the notification count query to refresh the badge
        queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleToggleShowUnread = () => {
    setShowUnreadOnly(prev => !prev);
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => n.unread)
    : notifications;


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
        {filteredNotifications.length === 0 ? (
          <div className="no-unread-notifications">
            <Bell size={70}/>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
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
                <div className="notification-details">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p className="notification-description">{notification.description}</p>
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
