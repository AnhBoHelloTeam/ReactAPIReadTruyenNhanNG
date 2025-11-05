import React, { useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { getThumbUrl } from '../../utils/image';
import { isFavorite } from '../../utils/favorites';

const QuickView = ({ comic, show, onHide }) => {
  if (!comic) return null;

  const fav = isFavorite(comic.slug);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{comic.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 200px' }}>
            <LazyLoadImage
              src={getThumbUrl(comic.thumb_url)}
              alt={comic.name}
              effect="blur"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ marginBottom: '12px' }}>
              {comic.category && comic.category.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {comic.category.slice(0, 3).map((cat, i) => (
                    <Badge bg="info" key={i}>{cat.name}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Trạng thái:</strong> {comic.status || 'Chưa rõ'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Cập nhật:</strong> {comic.updatedAt || 'Chưa rõ'}
            </div>
            {comic.content && (
              <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div dangerouslySetInnerHTML={{ __html: comic.content?.substring(0, 200) + '...' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button as={Link} to={`/comics/${comic.slug}`} variant="primary" onClick={onHide}>
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default QuickView;
