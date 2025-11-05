import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getThumbUrl, onImageErrorHide } from '../../utils/image';

const ComicCard = ({ item }) => {
  if (!item) return null;
  return (
    <Card className="card-equal-height">
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small style={{ opacity: 0.8 }}>{item.updatedAt}</small>
          <Button variant="primary btn-sm" as={Link} to={`/comics/${item.slug}`}>
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ComicCard;


