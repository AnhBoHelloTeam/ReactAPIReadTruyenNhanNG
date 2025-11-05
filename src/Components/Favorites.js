import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Menu from './Include/Menu';
import { getFavorites, removeFavorite } from '../utils/favorites';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getThumbUrl, onImageErrorHide } from '../utils/image';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemove = (slug) => {
    const next = removeFavorite(slug);
    setFavorites(next);
  };

  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <Container>
      <Menu />
      <Row>
        <Col>
          <h3>Yêu thích</h3>
          <Row>
            {favorites.length > 0 ? (
              favorites.map((comic, index) => {
                const tooltipText = [
                  `Tên: ${comic.name}`,
                  `Thể loại: ${comic.category ? comic.category.map(cat => cat.name).join(', ') : 'Không có'}`,
                  `Trạng thái: ${getStatus(comic)}`,
                ].join('\n');
                return (
                  <Col md={3} key={index}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        className="card-img-top"
                        src={getThumbUrl(comic.thumb_url)}
                        alt={comic.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title className="card-title-ellipsis" title={tooltipText}>
                          {comic.name}
                        </Card.Title>
                        <Card.Text>
                          {comic.category && comic.category.length > 0 ? (
                            <span className="category-ellipsis" title={comic.category.map(cat => cat.name).join(', ')}>
                              {comic.category.slice(0, 2).map((cat, i) => (
                                <Badge bg="info" key={i}>{cat.name}</Badge>
                              ))}
                              {comic.category.length > 2 && '...'}
                            </span>
                          ) : 'Others'}
                        </Card.Text>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button as={Link} to={`/comics/${comic.slug}`}>
                            Đọc
                          </Button>
                          <Button variant="outline-danger" onClick={() => handleRemove(comic.slug)}>
                            Bỏ thích
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })
            ) : (
              <Col>
                <p>Chưa có mục yêu thích</p>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Favorites;


