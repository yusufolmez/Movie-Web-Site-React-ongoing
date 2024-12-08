import React, { useState, useEffect } from 'react';

const Comments = ({ movieId, userSub, username }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/comments/${movieId}`);
      if (!response.ok) {
        throw new Error('Yorumları getirme hatası');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Yorumları getirme hatası:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/movies/comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId,
            userSub,
            username,
            commentText: newComment
          }),
        });

        if (!response.ok) {
          throw new Error('Yorum ekleme hatası');
        }

        setNewComment('');
        fetchComments(); // Yorumları yeniden yükle
      } catch (error) {
        console.error('Yorum ekleme hatası:', error);
      }
    }
  };

  return (
    <div className="comments-section">
      <h3>Yorumlar</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>{comment.user_sub === userSub ? 'Siz' : comment.username}:</strong> {comment.comment_text}
            <br />
            <small>{new Date(comment.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorumunuzu buraya yazın..."
        />
        <button type="submit">Yorum Ekle</button>
      </form>
    </div>
  );
};

export default Comments;

