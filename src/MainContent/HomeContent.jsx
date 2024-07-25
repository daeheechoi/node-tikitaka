import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeContent.css'; // 스타일을 위한 CSS 파일을 추가해야 합니다.
import logo from '../img/tikitakalogo.png';

const HomeContent = ({ userName }) => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://192.168.6.45:3001/posts', { withCredentials: true });
        setPosts(response.data);
        const postIds = response.data.map(post => post.id);
        const likeStatus = await axios.post('https://192.168.6.45:3001/check-like-status', { postIds }, {
          withCredentials: true
        });
        setLikedPosts(likeStatus.data.likedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchLikeCounts = async () => {
      try {
        const likeCountPromises = posts.map(post => 
          axios.post('https://192.168.6.45:3001/like-count', { postId: post.id }, {
            withCredentials: true
          })
        );
        const likeCountsResponses = await Promise.all(likeCountPromises);
        const newLikeCounts = {};
        likeCountsResponses.forEach((response, index) => {
          newLikeCounts[posts[index].id] = response.data.likeCount;
        });
        setLikeCounts(newLikeCounts);
      } catch (error) {
        console.error('Error fetching like counts:', error);
      }
    };

    if (posts.length > 0) {
      const interval = setInterval(fetchLikeCounts, 1000);
      return () => clearInterval(interval);
    }
  }, [posts]);

  const handleLike = async (postId) => {
    try {
      const response = await axios.post('https://192.168.6.45:3001/like-post', { postId }, {
        withCredentials: true
      });
      if (response.data.success) {
        setLikedPosts(prevLikedPosts => {
          if (prevLikedPosts.includes(postId)) {
            return prevLikedPosts.filter(id => id !== postId);
          } else {
            return [...prevLikedPosts, postId];
          }
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await axios.post('https://192.168.6.45:3001/delete-post', { postId }, {
        withCredentials: true
      });
      if (response.data.success) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleViewLikes = async (postId) => {
    try {
      const response = await axios.post('https://192.168.6.45:3001/liked-users', { postId }, {
        withCredentials: true
      });
      const likedUsers = response.data.likedUsers;
      const newWindow = window.open('', '_blank', 'width=400,height=600');
      newWindow.document.write('<html><head><title>좋아요</title></head><body>');
      newWindow.document.write('<h1>좋아요</h1>');
      newWindow.document.write('<ul>');
      likedUsers.forEach(user => {
        newWindow.document.write(`<li>${user}</li>`);
      });
      newWindow.document.write('</ul>');
      newWindow.document.write('</body></html>');
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`https://192.168.6.45:3001/comments/${postId}`, { withCredentials: true });
      setComments(prevComments => ({
        ...prevComments,
        [postId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment[postId]) return;
    try {
      const response = await axios.post('https://192.168.6.45:3001/comments', {
        postId,
        content: newComment[postId]
      }, {
        withCredentials: true
      });
      if (response.data.success) {
        setNewComment(prevNewComment => ({
          ...prevNewComment,
          [postId]: ''
        }));
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="home-content">
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <img src={logo} alt="티키타카 로고" style={{ width: '150px' }} />
      </div>
      <div className="post-list">
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.author}</h3>
            {post.image && <img src={`https://192.168.6.45:3001${post.image}`} alt="Post" className="post-image" />}
            {post.video && <video src={`https://192.168.6.45:3001${post.video}`} controls className="post-video" />}
            {post.file && <a href={`https://192.168.6.45:3001${post.file}`} download className="download-link">Download File</a>}
            <p className="post-content">{post.content}</p>
            <p className="tags">태그: {post.tags}</p>
            <p className="post-date">{new Date(post.date).toLocaleString()}</p>
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)} className={`like-btn ${likedPosts.includes(post.id) ? 'liked' : ''}`}>
                {likedPosts.includes(post.id) ? '좋아요 취소' : '좋아요'}
              </button>
              <button onClick={() => handleViewLikes(post.id)} className="view-likes-btn">
                좋아요 {likeCounts[post.id] || 0}개
              </button>
              {post.author === userName && (
                <button onClick={() => handleDelete(post.id)} className="delete-btn">삭제</button>
              )}
            </div>
            <div className="comments-section">
              <h4 style={{ margin: '0' }}>댓글</h4>
              <div className="comments-list">
                {comments[post.id] && comments[post.id].map(comment => (
                  <div key={comment.id} className="comment-item">
                    <p>{comment.author}: {comment.content}</p>
                    <p className="comment-date">{new Date(comment.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                placeholder="댓글을 입력하세요..."
                className="comment-input"
              />
              <button onClick={() => handleAddComment(post.id)} className="add-comment-button">댓글 달기</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;
