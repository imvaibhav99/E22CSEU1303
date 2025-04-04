import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress } from '@mui/material';
import { getUsers, getUserPosts, getPostComments, getRandomImage } from '../services/api';
import PostCard from './PostCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = [];
        const usersMap = new Map(Object.entries(users));
        const currentTimestamp = Date.now();
        setFetchTimestamp(currentTimestamp);

        for (const [userId, userName] of usersMap) {
          const userPosts = await getUserPosts(userId);
          allPosts.push(...userPosts.map(post => ({
            ...post,
            userName,
            userId,
            fetchTime: currentTimestamp,
            uniqueId: `${post.id}-${userId}-${Math.random().toString(36).substring(2, 9)}`
          })));
        }

        // Sort posts by ID in descending order (newest first)
        const sortedPosts = allPosts.sort((a, b) => b.id - a.id);

        // Add random images and fetch comments for each post
        const postsWithDetails = await Promise.all(
          sortedPosts.map(async (post) => {
            const comments = await getPostComments(post.id);
            return {
              ...post,
              image: getRandomImage(400, 200),
              commentCount: comments.length
            };
          })
        );

        // Deduplicate posts by ID
        const uniquePosts = [];
        const idSet = new Set();
        
        for (const post of postsWithDetails) {
          if (!idSet.has(post.id)) {
            idSet.add(post.id);
            uniquePosts.push(post);
          }
        }

        setPosts(uniquePosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(users).length > 0) {
      fetchPosts();
    }
  }, [users]);

  // Set up polling for new posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchNewPosts = async () => {
        try {
          const allPosts = [];
          const usersMap = new Map(Object.entries(users));
          const currentTimestamp = Date.now();
          setFetchTimestamp(currentTimestamp);

          for (const [userId, userName] of usersMap) {
            const userPosts = await getUserPosts(userId);
            allPosts.push(...userPosts.map(post => ({
              ...post,
              userName,
              userId,
              fetchTime: currentTimestamp,
              uniqueId: `${post.id}-${userId}-${Math.random().toString(36).substring(2, 9)}`
            })));
          }

          const sortedPosts = allPosts.sort((a, b) => b.id - a.id);
          const postsWithDetails = await Promise.all(
            sortedPosts.map(async (post) => {
              const comments = await getPostComments(post.id);
              return {
                ...post,
                image: getRandomImage(400, 200),
                commentCount: comments.length
              };
            })
          );

          // Deduplicate posts by ID
          const uniquePosts = [];
          const idSet = new Set();
          
          for (const post of postsWithDetails) {
            if (!idSet.has(post.id)) {
              idSet.add(post.id);
              uniquePosts.push(post);
            }
          }

          setPosts(uniquePosts);
        } catch (error) {
          console.error('Error updating feed:', error);
        }
      };

      fetchNewPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [users]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="#333" sx={{ mb: 4, borderBottom: '3px solid #d32f2f', pb: 1, display: 'inline-block' }}>
        Feed
      </Typography>
      <Grid container spacing={4}>
        {posts.map((post, index) => (
          <Grid item xs={12} md={6} key={post.uniqueId || `post-${post.id}-${index}`}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Feed; 