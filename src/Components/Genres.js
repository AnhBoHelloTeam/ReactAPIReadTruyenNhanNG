import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Menu from './Include/Menu';
import { apiClient } from '../api/client';
import SectionTitle from './UI/SectionTitle';

const Genres = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/the-loai');
        setData(res?.data?.data?.items || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q));
  }, [data, query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Helmet>
        <title>Danh sách thể loại</title>
        <meta name="description" content="Tất cả thể loại truyện tranh" />
      </Helmet>
      <Container>
        <Menu />
        <Row style={{ marginBottom: 24 }}>
          <Col>
            <div className="hero-section">
              <SectionTitle style={{ marginTop: 0 }}>Danh sách thể loại</SectionTitle>
              <p style={{ color: 'rgba(228, 230, 235, 0.8)', marginBottom: 16 }}>Tìm kiếm và khám phá các thể loại truyện</p>
              <Form.Control
                type="text"
                placeholder="Tìm thể loại..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ maxWidth: 400 }}
              />
            </div>
          </Col>
        </Row>
        <Row>
          {filtered.length > 0 ? (
            filtered.map((g, idx) => (
              <Col md={3} key={idx}>
                <Card className="card-equal-height">
                  <Card.Body style={{ textAlign: 'center' }}>
                    <Card.Title className="card-title-ellipsis" title={g.name} style={{ fontSize: '1.2rem', marginBottom: 12 }}>
                      {g.name}
                    </Card.Title>
                    {typeof g.total === 'number' && (
                      <div style={{ marginBottom: 12 }}>
                        <Badge bg="info" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>{g.total} truyện</Badge>
                      </div>
                    )}
                    <Button variant="primary" as={Link} to={`/genre/${g.slug}`} style={{ width: '100%' }}>
                      Xem truyện →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>Không tìm thấy thể loại phù hợp</p>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Genres;


