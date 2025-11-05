import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
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
      <Row>
        <Col>
          <h3>Lịch sử đọc</h3>
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
                  <Col md={3} key={index}>
                    <Card className="card-equal-height">
                      <LazyLoadImage
                        className="card-img-top"
                        src={`https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}`}
                        alt={comic.name}
                        effect="blur"
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
                        <Card.Text>Đọc tiếp: Chapter {comic.lastChapter}</Card.Text>
                        <Button as={Link} to={`/comics/${comic.slug}`}>
                          Đọc tiếp
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })
            ) : (
              <Col>
                <p>Chưa có lịch sử đọc</p>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default History;