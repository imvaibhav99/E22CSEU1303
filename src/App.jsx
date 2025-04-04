import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={3} color="primary">
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              Social Media Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="inherit" 
                component={Link} 
                to="/"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                Feed
              </Button>
              <Button 
                variant="contained" 
                color="inherit" 
                component={Link} 
                to="/top-users"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                Top Users
              </Button>
              <Button 
                variant="contained" 
                color="inherit" 
                component={Link} 
                to="/trending"
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                Trending Posts
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/top-users" element={<TopUsers />} />
            <Route path="/trending" element={<TrendingPosts />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
