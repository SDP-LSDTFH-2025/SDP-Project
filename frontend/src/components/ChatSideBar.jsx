import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MessageSquare, Send, Phone, Video } from "lucide-react";
import { useState } from "react";

export const ChatSidebar = ({ friends }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "studying": return "bg-secondary";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online": return "Online";
      case "studying": return "Studying";
      case "offline": return "Offline";
      default: return "Unknown";
    }
  };

  const mockMessages = [
    { sender: "Alex Johnson", text: "Hey! Are you free to study together?", time: "2m ago", isMe: false },
    { sender: "You", text: "Sure! What subject?", time: "1m ago", isMe: true },
    { sender: "Alex Johnson", text: "CS 101 - algorithms", time: "30s ago", isMe: false }
  ];

  return (
    <div className="space-y-4">
      {/* Study Buddies List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="mr-2 h-5 w-5 text-secondary" />
            Study Buddies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friends.map((friend) => (
            <div 
              key={friend.id} 
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat === friend.id ? 'bg-secondary/10' : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedChat(friend.id)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-accent text-white">
                    {friend.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(friend.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground">{friend.course}</p>
                <p className="text-xs text-muted-foreground">{getStatusText(friend.status)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat Window */}
      {selectedChat && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {friends.find(f => f.id === selectedChat)?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {friends.find(f => f.id === selectedChat)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStatusText(friends.find(f => f.id === selectedChat)?.status || "")}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-60 overflow-y-auto" style={{ paddingRight: '8px' }}>
              {mockMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isMe 
                      ? 'bg-gradient-primary text-white' 
                      : 'bg-muted text-foreground'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input 
                placeholder="Type a message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && setMessage('')}
              />
              <Button 
                size="sm" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => setMessage('')}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Groups */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Active Study Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">MATH 301 Study Group</p>
              <Badge className="bg-green-100 text-green-800 text-xs">4 online</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Preparing for midterm exam</p>
            <Button size="sm" variant="outline" className="w-full">
              Join Session
            </Button>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">CS 101 Algorithms</p>
              <Badge className="bg-secondary/20 text-secondary text-xs">2 online</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Working on assignment 3</p>
            <Button size="sm" variant="outline" className="w-full">
              Join Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
