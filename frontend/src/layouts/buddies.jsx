import React, { useState } from 'react';
import {
  Box,
  Toolbar,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const mockUsers = [
  { id: 1, name: 'John Doe', bio: 'Software Engineer at Tech Corp', location: 'San Francisco, CA' },
  { id: 2, name: 'Jane Smith', bio: 'UI/UX Designer', location: 'New York, NY' },
  { id: 3, name: 'Alice Johnson', bio: 'Product Manager', location: 'Austin, TX' },
  { id: 4, name: 'Bob Brown', bio: 'Data Scientist', location: 'Seattle, WA' },
  { id: 5, name: 'Charlie Davis', bio: 'Marketing Specialist', location: 'Chicago, IL' },
  { id: 6, name: 'Diana Evans', bio: 'HR Coordinator', location: 'Los Angeles, CA' },
];

function Buddies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setQuery(q);
    if (q) {
      const filtered = mockUsers.filter(
        (u) => u.name.toLowerCase().includes(q) && !connections.some((c) => c.id === u.id)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const sendRequest = (user) => {
    // Simulate sending connection request (in real app, call API here)
    setConnections([...connections, user]);
    setResults(results.filter((u) => u.id !== user.id));
  };

  const viewProfile = (user) => {
    setSelectedUser(user);
  };

  const closeProfile = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <Box position="static">
        <Toolbar>
            <TextField
            placeholder="Search for buddies..."
            value={query}
            onChange={handleSearch}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 10 }}
            />

            <Button >
                Search
            </Button>
        </Toolbar>
      </Box>
      <div style={{ padding: 16 }}>
        {results.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <List>
              {results.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemAvatar>
                    <Avatar>{user.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.location} />
                  <Button variant="outlined" onClick={() => viewProfile(user)} sx={{ mr: 1 }}>
                    View Profile
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => sendRequest(user)}>
                    Send Request
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}
        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>
          My Connections
        </Typography>
        <List>
          {connections.map((user) => (
            <ListItem key={user.id} divider>
              <ListItemAvatar>
                <Avatar>{user.name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.location} />
              <Button variant="outlined" onClick={() => viewProfile(user)}>
                View Profile
              </Button>
            </ListItem>
          ))}
          {connections.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              No connections yet. Start searching and connecting!
            </Typography>
          )}
        </List>
      </div>
      <Dialog open={!!selectedUser} onClose={closeProfile} maxWidth="sm" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle>{selectedUser.name}'s Profile</DialogTitle>
            <DialogContent>
              <Avatar sx={{ width: 80, height: 80, mb: 2 }}>{selectedUser.name[0]}</Avatar>
              <Typography variant="body1" gutterBottom>
                <strong>Bio:</strong> {selectedUser.bio}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> {selectedUser.location}
              </Typography>
              {/* Add more profile details here as needed */}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeProfile}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default Buddies;