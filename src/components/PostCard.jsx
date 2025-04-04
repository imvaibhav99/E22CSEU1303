import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  CardHeader,

  CardMedia, 
  IconButton,
  CardActions,
  Divider,
  styled
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { getRandomImage } from '../services/api';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  backgroundColor: '#fff',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
  },
}));

const PostContent = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.6,
  padding: theme.spacing(0, 1),
  marginBottom: theme.spacing(2),
}));

const PostMedia = styled(CardMedia)(({ theme }) => ({
  height: 0,
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  overflow: 'hidden',
}));

const CommentCount = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  margin: theme.spacing(0, 1),
}));

const PostCard = ({ post }) => {
  return (
    <StyledCard>
      <CardHeader
        avatar={
          <Avatar 
            src={getRandomImage(50, 50)} 
            alt={post.userName}
            sx={{ 
              width: 48, 
              height: 48,
              border: '2px solid #d32f2f' 
            }} 
          />
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {post.userName}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        }
        sx={{ 
          pb: 1, 
          '& .MuiCardHeader-title': { 
            color: '#333',
            fontSize: '1rem'
          } 
        }}
      />
      
      <PostMedia
        image={post.image}
        title="Post image"
      />
      
      <CardContent sx={{ pt: 2, pb: 1 }}>
        <PostContent>
          {post.content}
        </PostContent>
      </CardContent>
      
      <Divider sx={{ mx: 2 }} />
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton aria-label="like" size="small" sx={{ color: '#d32f2f' }}>
            <FavoriteIcon fontSize="small" />
          </IconButton>
          
          <IconButton aria-label="comment" size="small">
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
          
          <IconButton aria-label="share" size="small">
            <ShareIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CommentCount>
            {post.commentCount} comments
          </CommentCount>
          
          <IconButton aria-label="bookmark" size="small">
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default PostCard; 