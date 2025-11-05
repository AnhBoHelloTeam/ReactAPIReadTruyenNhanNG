import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Menu from './Include/Menu';
import { apiClient } from '../api/client';

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
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Danh sách thể loại</Card.Title>
                <Form.Control
                  type="text"
                  placeholder="Tìm thể loại..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 10 }}>
          {filtered.length > 0 ? (
            filtered.map((g, idx) => (
              <Col md={3} key={idx}>
                <Card className="card-equal-height">
                  <Card.Body>
                    <Card.Title className="card-title-ellipsis" title={g.name}>
                      {g.name}
                    </Card.Title>
                    {typeof g.total === 'number' && (
                      <div style={{ marginBottom: 8 }}>
                        <Badge bg="secondary">{g.total} truyện</Badge>
                      </div>
                    )}
                    <Card.Text>
                      <Link to={`/genre/${g.slug}`}>Xem truyện</Link>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card.Body>Không tìm thấy thể loại phù hợp</Card.Body>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Genres;


