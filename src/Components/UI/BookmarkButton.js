import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { getBookmarks, addBookmark, removeBookmark, updateBookmarkNote } from '../../utils/bookmarks';

const BookmarkButton = ({ slug, chapterId, currentPage, imageUrl }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [show, setShow] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (slug && chapterId) {
      setBookmarks(getBookmarks(slug, chapterId));
    }
  }, [slug, chapterId, currentPage]);

  const handleAddBookmark = () => {
    if (slug && chapterId && currentPage) {
      const updated = addBookmark(slug, chapterId, currentPage, imageUrl);
      setBookmarks(updated);
      setNote('');
    }
  };

  const handleRemoveBookmark = (pageNumber) => {
    if (slug && chapterId) {
      const updated = removeBookmark(slug, chapterId, pageNumber);
      setBookmarks(updated);
    }
  };

  const handleUpdateNote = (pageNumber, newNote) => {
    if (slug && chapterId) {
      const updated = updateBookmarkNote(slug, chapterId, pageNumber, newNote);
      setBookmarks(updated);
    }
  };

  const isBookmarked = bookmarks.some(b => b.pageNumber === currentPage);

  return (
    <>
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5, display: 'flex', gap: '8px' }}>
        <Button
          variant={isBookmarked ? "warning" : "outline-light"}
          size="sm"
          onClick={() => {
            if (isBookmarked) {
              handleRemoveBookmark(currentPage);
            } else {
              handleAddBookmark();
            }
          }}
          title={isBookmarked ? "Bỏ đánh dấu trang này" : "Đánh dấu trang này"}
          style={{
            borderRadius: '10px',
            padding: '8px 12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {isBookmarked ? '🔖' : '📑'}
        </Button>
        {bookmarks.length > 0 && (
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShow(true)}
            title="Xem danh sách đánh dấu"
            style={{
              borderRadius: '10px',
              padding: '8px 12px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)'
            }}
          >
            📚 <Badge bg="warning" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>{bookmarks.length}</Badge>
          </Button>
        )}
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đánh dấu trang ({bookmarks.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookmarks.length > 0 ? (
            <ListGroup>
              {bookmarks.map((bookmark, idx) => (
                <ListGroup.Item key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Trang {bookmark.pageNumber}</strong>
                    {bookmark.note && <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#666' }}>{bookmark.note}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        const newNote = prompt('Nhập ghi chú:', bookmark.note || '');
                        if (newNote !== null) {
                          handleUpdateNote(bookmark.pageNumber, newNote);
                        }
                      }}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveBookmark(bookmark.pageNumber)}
                    >
                      🗑️
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>Chưa có trang nào được đánh dấu</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookmarkButton;
