import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Check, X, Users } from "lucide-react";

export const FriendRequests = () => {
  const mockRequests = [
    {
      id: 1,
      name: "Sophie Martinez",
      school: "MIT",
      course: "Computer Science",
      mutualFriends: 3,
      interests: ["Machine Learning", "Web Development", "Data Science"]
    },
    {
      id: 2,
      name: "David Chen",
      school: "Stanford",
      course: "Mathematics",
      mutualFriends: 1,
      interests: ["Calculus", "Statistics", "Linear Algebra"]
    }
  ];

  const suggestedFriends = [
    {
      id: 3,
      name: "Emma Thompson",
      school: "UC Berkeley",
      course: "Physics",
      mutualFriends: 2,
      interests: ["Quantum Physics", "Thermodynamics", "Research"]
    },
    {
      id: 4,
      name: "Ryan Park",
      school: "MIT",
      course: "Computer Science",
      mutualFriends: 5,
      interests: ["Algorithms", "Software Engineering", "AI"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-secondary" />
            Friend Requests
            <Badge className="ml-2 bg-accent text-accent-foreground">{mockRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-accent text-white">
                    {request.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{request.name}</p>
                  <p className="text-sm text-muted-foreground">{request.school} • {request.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.mutualFriends} mutual friends
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {request.interests.slice(0, 2).map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {request.interests.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{request.interests.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suggested Friends */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Suggested Study Buddies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {friend.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{friend.school} • {friend.course}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.mutualFriends} mutual friends
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {friend.interests.slice(0, 2).map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {friend.interests.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{friend.interests.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                Add Friend
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
