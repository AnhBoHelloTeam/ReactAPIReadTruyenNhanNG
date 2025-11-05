import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Badge, InputGroup } from 'react-bootstrap';
import { getComments, addComment, deleteComment, likeComment } from '../../utils/comments';

const Comments = ({ slug, chapterId }) => {
  const [show, setShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (slug) {
      setComments(getComments(slug, chapterId));
    }
  }, [slug, chapterId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const updated = addComment(slug, chapterId, newComment.trim());
    setComments(updated);
    setNewComment('');
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      const updated = deleteComment(slug, chapterId, commentId);
      setComments(updated);
    }
  };

  const handleLike = (commentId) => {
    const updated = likeComment(slug, chapterId, commentId);
    setComments(updated);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <>
      <Button
        variant="outline-light"
        size="sm"
        onClick={() => setShow(true)}
        title="Bình luận"
      >
        💬 {comments.length > 0 && <Badge bg="info" style={{ marginLeft: '4px' }}>{comments.length}</Badge>}
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bình luận ({comments.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Form.Group className="mb-3">
            <InputGroup>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddComment();
                  }
                }}
              />
            </InputGroup>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              style={{ marginTop: '8px' }}
            >
              Gửi (Ctrl+Enter)
            </Button>
          </Form.Group>

          {comments.length > 0 ? (
            <ListGroup>
              {comments.map((comment) => (
                <ListGroup.Item key={comment.id} style={{ border: 'none', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{comment.author}</strong>
                        <small style={{ color: 'var(--text-secondary)' }}>{formatTime(comment.timestamp)}</small>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleLike(comment.id)}
                        style={{ padding: '2px 8px' }}
                      >
                        👍 {comment.likes || 0}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        style={{ padding: '2px 8px' }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Comments;
