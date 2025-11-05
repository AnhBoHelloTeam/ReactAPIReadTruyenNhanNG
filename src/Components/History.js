import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

const History = () => {
  const [readingHistory, setReadingHistory] = useState([]);

  useEffect(() => {
    setReadingHistory(JSON.parse(localStorage.getItem('readingHistory')) || []);
  }, []);

  // Hàm lấy trạng thái từ dữ liệu
  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
      <Container>
        <Menu />
        <Row style={{ marginBottom: 24 }}>
          <Col>
            <div className="hero-section">
              <SectionTitle style={{ marginTop: 0 }}>Lịch sử đọc</SectionTitle>
              <p style={{ color: '#1a1a1a', marginBottom: 0 }}>Tiếp tục đọc những truyện bạn đã xem</p>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
          <Row>
            {readingHistory.length > 0 ? (
              readingHistory.map((comic, index) => {
                const tooltipText = [
                  `Tên: ${comic.name}`,
                  `Thể loại: ${comic.category ? comic.category.map(cat => cat.name).join(', ') : 'Không có'}`,
                  `Mô tả: ${comic.description || 'Không có'}`,
                  `Trạng thái: ${getStatus(comic)}`,
                ].join('\n');
                return (
                  <Col md={3} key={index}><ComicCard item={comic} /></Col>
                );
              })
            ) : (
              <Col>
                <div className="empty-state">
                  <div className="empty-state-icon">📖</div>
                  <p>Chưa có lịch sử đọc</p>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default History;