import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress } from '@mui/material';
import { getUsers, getUserPosts, getPostComments, getRandomImage } from '../services/api';
import PostCard from './PostCard';

const TrendingPosts = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const users = await getUsers();
        const allPosts = [];
        const usersMap = new Map(Object.entries(users));

        // Fetch all posts from all users
        for (const [userId, userName] of usersMap) {
          const posts = await getUserPosts(userId);
          allPosts.push(...posts.map(post => ({
            ...post,
            userName,
            userId,
            uniqueId: `${post.id}-${userId}-${Math.random().toString(36).substring(2, 9)}`
          })));
        }

        // Fetch comments for all posts
        const postsWithComments = await Promise.all(
          allPosts.map(async (post) => {
            const comments = await getPostComments(post.id);
            return {
              ...post,
              commentCount: comments.length
            };
          })
        );

        // Find the maximum comment count
        const maxComments = Math.max(...postsWithComments.map(post => post.commentCount));

        // Filter posts with the maximum number of comments
        const trending = postsWithComments.filter(post => post.commentCount === maxComments);

        // Add random images and format the data
        const formattedPosts = trending.map(post => ({
          ...post,
          image: getRandomImage(400, 200)
        }));

        // Deduplicate posts by ID
        const uniquePosts = [];
        const idSet = new Set();
        
        for (const post of formattedPosts) {
          if (!idSet.has(post.id)) {
            idSet.add(post.id);
            uniquePosts.push(post);
          }
        }

        setTrendingPosts(uniquePosts);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

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
        Trending Posts
      </Typography>
      <Grid container spacing={4}>
        {trendingPosts.map((post, index) => (
          <Grid item xs={12} md={6} key={post.uniqueId || `trending-${post.id}-${index}`}>
            <PostCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TrendingPosts; 