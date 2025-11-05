import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import { Helmet } from 'react-helmet';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';

const Home = () => {
  const [getdata, setData] = useState([]);
  const [hotComics, setHotComics] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const items = getdata?.data?.data?.items;
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(
          `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${currentPage}`
        );
        setData(response);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const fetchHotComics = async () => {
      try {
        const response = await apiClient.get('/danh-sach/truyen-hot');
        setHotComics(response.data.data.items.slice(0, 4)); // Lấy 4 truyện hot
      } catch (error) {
        console.error('Error fetching hot comics:', error);
      }
    };
    fetchHotComics();
  }, []);

  // Fetch additional home blocks once
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const [ongoingRes, completedRes, upcomingRes, trendingRes] = await Promise.all([
          apiClient.get('/danh-sach/dang-phat-hanh?page=1'),
          apiClient.get('/danh-sach/hoan-thanh?page=1'),
          apiClient.get('/danh-sach/sap-ra-mat?page=1'),
          apiClient.get('/danh-sach/trending?page=1'),
        ]);
        setOngoing((ongoingRes.data?.data?.items || []).slice(0, 8));
        setCompleted((completedRes.data?.data?.items || []).slice(0, 8));
        setUpcoming((upcomingRes.data?.data?.items || []).slice(0, 8));
        setTrending((trendingRes.data?.data?.items || []).slice(0, 8));
      } catch (e) {
        console.error('Error fetching home blocks', e);
      }
    };
    fetchBlocks();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const totalItems = getdata?.data?.params?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data?.data?.seoOnPage?.titleHead || 'Otruyen NhanNG'}</title>
        <meta name="description" content={getdata.data?.data?.seoOnPage?.descriptionHead || 'Otruyen NhanNG - Đọc truyện tranh miễn phí, cập nhật nhanh'} />
      </Helmet>
      <Container>
        <Menu />
        {/* Hero Section */}
        <Row>
          <Col>
            <div className="hero-section">
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Kho Truyện Tranh Đa Dạng
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'rgba(228, 230, 235, 0.8)', marginBottom: 24 }}>
                Khám phá hàng nghìn bộ truyện mới cập nhật mỗi ngày
              </p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">24,816</div>
                  <div className="stat-label">Tổng số truyện</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">164</div>
                  <div className="stat-label">Cập nhật hôm nay</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">20,863</div>
                  <div className="stat-label">Đang phát hành</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">3,537</div>
                  <div className="stat-label">Hoàn thành</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <SectionTitle>Truyện Hot</SectionTitle>
            <Row>
              {hotComics.length > 0 ? (
                hotComics.map((comic, index) => (
                  <Col md={3} key={index}>
                    <ComicCard item={comic} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có truyện hot</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Ongoing */}
        <Row>
          <Col>
            <SectionTitle>Đang phát hành</SectionTitle>
            <Row>
              {ongoing.length > 0 ? (
                ongoing.map((item, index) => (
                  <Col md={3} key={`ongoing-${index}`}>
                    <ComicCard item={item} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Completed */}
        <Row>
          <Col>
            <SectionTitle>Hoàn thành</SectionTitle>
            <Row>
              {completed.length > 0 ? (
                completed.map((item, index) => (
                  <Col md={3} key={`completed-${index}`}>
                    <ComicCard item={item} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Upcoming */}
        <Row>
          <Col>
            <SectionTitle>Sắp ra mắt</SectionTitle>
            <Row>
              {upcoming.length > 0 ? (
                upcoming.map((item, index) => (
                  <Col md={3} key={`upcoming-${index}`}>
                    <ComicCard item={item} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {/* Trending */}
        <Row>
          <Col>
            <SectionTitle>Top Trending</SectionTitle>
            <Row>
              {trending.length > 0 ? (
                trending.map((item, index) => (
                  <Col md={3} key={`trending-${index}`}>
                    <ComicCard item={item} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p>Không có dữ liệu</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        <Pagination className="pagination-container">
          <Pagination.Prev
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const rangeEnd = Math.min(rangeStart + 4, totalPages);
            if (pageNumber >= rangeStart && pageNumber <= rangeEnd) {
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            }
            return null;
          })}
          <Pagination.Next
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{getdata.data?.data?.seoOnPage.titleHead}</Card.Title>
                <Card.Text>{getdata.data?.data?.seoOnPage.descriptionHead}</Card.Text>
              </Card.Body>
            </Card>
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
                <div className="empty-state-icon">📚</div>
                <p>Không có dữ liệu</p>
              </div>
            </Col>
          )}
        </Row>
        <Pagination className="pagination-container">
          <Pagination.Prev
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const rangeEnd = Math.min(rangeStart + 4, totalPages);
            if (pageNumber >= rangeStart && pageNumber <= rangeEnd) {
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            }
            return null;
          })}
          <Pagination.Next
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </Container>
    </>
  );
};

export default Home;