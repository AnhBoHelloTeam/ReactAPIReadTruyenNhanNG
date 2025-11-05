import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Menu from './Include/Menu';
import { getFavorites, removeFavorite } from '../utils/favorites';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import ComicCard from './UI/ComicCard';

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
                  <Col md={3} key={index}><ComicCard item={comic} /></Col>
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


