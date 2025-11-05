import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getThumbUrl, onImageErrorHide } from '../../utils/image';
import { hasNewChapters } from '../../utils/notifications';
import QuickView from './QuickView';

const ComicCard = ({ item }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  if (!item) return null;
  const hasNew = hasNewChapters(item.slug);
  return (
    <>
      <Card 
        className="card-equal-height" 
        style={{ position: 'relative', cursor: 'pointer' }}
        onMouseEnter={() => setShowQuickView(true)}
        onMouseLeave={() => setShowQuickView(false)}
      >
      {hasNew && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#ffffff',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: 700,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          NEW
        </div>
      )}
      <LazyLoadImage
        className="card-img-top"
        src={getThumbUrl(item.thumb_url)}
        alt={item.name}
        effect="blur"
        onError={onImageErrorHide}
        style={{ width: '100%', height: 'auto' }}
      />
      <Card.Body>
        <Card.Title className="card-title-ellipsis" title={item.name}>
          {item.name}
        </Card.Title>
        <Card.Text>
          {item.category && item.category.length > 0 ? (
            <span className="category-ellipsis" title={item.category.map((cat) => cat.name).join(', ')}>
              {item.category.slice(0, 2).map((cat, i) => (
                <Badge bg="info" key={i} style={{ marginRight: 6 }}>{cat.name}</Badge>
              ))}
              {item.category.length > 2 && '...'}
            </span>
          ) : 'Others'}
        </Card.Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <small style={{ fontWeight: 500, fontSize: '0.85rem' }}>{item.updatedAt}</small>
          <Button variant="primary btn-sm" as={Link} to={`/comics/${item.slug}`}>
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
    <QuickView comic={item} show={showQuickView} onHide={() => setShowQuickView(false)} />
    </>
  );
};

export default ComicCard;


