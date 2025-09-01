import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Share2, Download } from "lucide-react";
import { useState } from "react";

export const ResourceCard = ({ resource }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const mockComments = [
    { author: "Alex Kim", text: "This is really helpful! Thanks for sharing.", time: "1h ago" },
    { author: "Maria Garcia", text: "Could you explain the third section more?", time: "45m ago" }
  ];

  return (
    <Card className="shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-accent text-white">
                {resource.author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{resource.author}</p>
              <p className="text-sm text-muted-foreground">{resource.timestamp} • {resource.course}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            {resource.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg text-foreground mb-2">{resource.title}</h3>
          <p className="text-muted-foreground">{resource.preview}</p>
        </div>

        {/* Resource Preview Area */}
        <div className="bg-muted rounded-lg p-6 text-center">
          <div className="bg-gradient-primary rounded-lg p-8 text-white">
            <p className="text-sm opacity-90">📄 {resource.type} Preview</p>
            <p className="font-semibold mt-2">{resource.title}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-2 hover:text-accent transition-colors ${
                liked ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{resource.likes + (liked ? 1 : 0)}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-secondary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{resource.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-tertiary transition-colors">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-border pt-4 space-y-3">
            {mockComments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-semibold text-sm text-foreground">{comment.author}</p>
                    <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{comment.time}</p>
                </div>
              </div>
            ))}
            
            <div className="flex space-x-3 mt-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-white text-xs">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Button size="sm" className="bg-gradient-primary">Post</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
