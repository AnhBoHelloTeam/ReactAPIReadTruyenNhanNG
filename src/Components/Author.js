import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const Author = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/tim-kiem', {
          params: {
            author: slug,
            page: currentPage,
          },
        });
        setData(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    setError(null);
    fetchData();
  }, [slug, currentPage]);

  if (loading) {
    return (
      <Container>
        <Menu />
        <SkeletonGrid count={8} />
      </Container>
    );
  }
  if (error) {
    return (
      <Container>
        <Menu />
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  const items = data?.data?.items || [];
  const totalItems = data?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const title = data?.seoOnPage?.titleHead || `Tác giả: ${slug}`;
  const desc = data?.seoOnPage?.descriptionHead || '';

  const getStatus = (item) => {
    return item.status || (item.updatedAt && 'Đang cập nhật') || 'Chưa rõ';
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
      </Helmet>
      <Container>
        <Menu />
        <Row style={{ marginBottom: 24 }}>
          <Col>
            <div className="hero-section">
              <SectionTitle style={{ marginTop: 0 }}>{title}</SectionTitle>
              <p style={{ color: '#1a1a1a', marginBottom: 0 }}>{desc}</p>
            </div>
          </Col>
        </Row>
        <Row>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <Col md={3} key={index}>
                <ComicCard item={item} />
              </Col>
            ))
          ) : (
            <Col>
              <div className="empty-state">
                <div className="empty-state-icon">✍️</div>
                <p>Không có truyện nào</p>
              </div>
            </Col>
          )}
        </Row>
        <Pagination className="pagination-container">
          <Pagination.Prev onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const rangeEnd = Math.min(rangeStart + 4, totalPages);
            if (pageNumber >= rangeStart && pageNumber <= rangeEnd) {
              return (
                <Pagination.Item key={pageNumber} active={pageNumber === currentPage} onClick={() => paginate(pageNumber)}>
                  {pageNumber}
                </Pagination.Item>
              );
            }
            return null;
          })}
          <Pagination.Next onClick={() => currentPage < totalPages && paginate(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </Container>
    </>
  );
};

export default Author;


