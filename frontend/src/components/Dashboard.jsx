import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Search, 
  Users, 
  BookOpen, 
  UserPlus, 
  Upload,
  Filter,
  Bell,
  Settings
} from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { FriendRequests } from "./FriendRequests";
import { ChatSidebar } from "./ChatSidebar";
import "./styles/global.css";

function Dashboard(){
  const [activeTab, setActiveTab] = useState("feed");

  const mockResources = [
    {
      id: 1,
      title: "Advanced Calculus Study Guide",
      type: "PDF",
      author: "Sarah Chen",
      course: "MATH 301",
      likes: 24,
      comments: 8,
      timestamp: "2 hours ago",
      preview: "Comprehensive guide covering limits, derivatives, and integrals..."
    },
    {
      id: 2,
      title: "Organic Chemistry Reaction Map",
      type: "Image",
      author: "Mike Rodriguez",
      course: "CHEM 242",
      likes: 31,
      comments: 12,
      timestamp: "4 hours ago",
      preview: "Visual representation of common organic chemistry reactions..."
    }
  ];

  const mockFriends = [
    { id: 1, name: "Alex Johnson", status: "online", course: "CS 101" },
    { id: 2, name: "Emma Davis", status: "studying", course: "MATH 301" },
    { id: 3, name: "James Wilson", status: "offline", course: "PHYS 201" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudyBuddy
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search resources, friends, courses..." 
                className="pl-10 w-96 bg-input border-border focus:ring-secondary"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground px-1.5 py-0.5 text-xs">
                3
              </Badge>
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-primary text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={activeTab === "feed" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("feed")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Resource Feed
                </Button>
                <Button 
                  variant={activeTab === "friends" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("friends")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Study Groups
                </Button>
                <Button 
                  variant={activeTab === "requests" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("requests")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Friend Requests
                  <Badge className="ml-auto bg-accent text-accent-foreground">2</Badge>
                </Button>
                <Button 
                  variant={activeTab === "upload" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("upload")}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card className="mt-4 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course</label>
                  <Input placeholder="Enter course code" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">School</label>
                  <Input placeholder="Enter school name" className="mt-1" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Mathematics</Badge>
                  <Badge variant="outline">Chemistry</Badge>
                  <Badge variant="outline">Physics</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            {activeTab === "feed" && (
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Share a Resource</span>
                      <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input placeholder="What would you like to share with your study buddies?" />
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {mockResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "requests" && <FriendRequests />}

            {activeTab === "upload" && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Upload Study Resource</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Resource title" />
                  <Input placeholder="Course code" />
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Drag and drop your files here, or click to browse</p>
                    <Button className="mt-4 bg-gradient-primary">Choose Files</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="col-span-3">
            <ChatSidebar friends={mockFriends} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
