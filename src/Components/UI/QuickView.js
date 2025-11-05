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
      <Modal.Body style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 220px' }}>
            <LazyLoadImage
              src={getThumbUrl(comic.thumb_url)}
              alt={comic.name}
              effect="blur"
              style={{ 
                width: '100%', 
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h5 style={{ 
              marginBottom: '16px', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {comic.name}
            </h5>
            <div style={{ marginBottom: '16px' }}>
              {comic.category && comic.category.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {comic.category.slice(0, 4).map((cat, i) => (
                    <Badge bg="info" key={i}>{cat.name}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div><strong>Trạng thái:</strong> <Badge bg="secondary">{comic.status || 'Chưa rõ'}</Badge></div>
              <div><strong>Cập nhật:</strong> <Badge bg="info">{comic.updatedAt || 'Chưa rõ'}</Badge></div>
            </div>
            {comic.content && (
              <div style={{ 
                marginBottom: '16px', 
                color: 'var(--text-secondary)', 
                fontSize: '0.95rem',
                lineHeight: '1.6',
                maxHeight: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <div dangerouslySetInnerHTML={{ __html: comic.content?.substring(0, 250) + '...' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button as={Link} to={`/comics/${comic.slug}`} variant="primary" onClick={onHide} style={{ borderRadius: '10px' }}>
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
