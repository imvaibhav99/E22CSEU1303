import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Avatar, Box } from '@mui/material';
import { getUsers, getUserPosts, getRandomImage } from '../services/api';

const TopUsers = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const users = await getUsers();
        const userPostsPromises = Object.entries(users).map(async ([userId, userName]) => {
          const posts = await getUserPosts(userId);
          return {
            id: userId,
            name: userName,
            postCount: posts.length,
            avatar: getRandomImage(100, 100)
          };
        });

        const usersWithPosts = await Promise.all(userPostsPromises);
        const sortedUsers = usersWithPosts
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 5);

        setTopUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching top users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return <Typography>Loading top users...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Top Users
      </Typography>
      <Grid container spacing={3}>
        {topUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography color="textSecondary">
                      {user.postCount} posts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopUsers; 