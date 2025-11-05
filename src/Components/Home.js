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
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';
import { getRecentlyViewed } from '../utils/recommendations';

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
  const [allItems, setAllItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const items = getdata?.data?.data?.items;
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=1`
        );
        setData(response);
        const newItems = response?.data?.data?.items || [];
        setAllItems(newItems);
        setHasMore(newItems.length >= itemsPerPage);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Infinite scroll load more
  useEffect(() => {
    const loadMore = async () => {
      if (!hasMore || loadingMore) return;
      
      setLoadingMore(true);
      try {
        const nextPage = Math.floor(allItems.length / itemsPerPage) + 1;
        const response = await apiClient.get(
          `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${nextPage}`
        );
        const newItems = response?.data?.data?.items || [];
        if (newItems.length > 0) {
          setAllItems(prev => [...prev, ...newItems]);
          setHasMore(newItems.length >= itemsPerPage);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error('Error loading more:', e);
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    };

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        loadMore();
      }
    };

    if (hasMore) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loadingMore, allItems.length, itemsPerPage]);

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
    
    // Get recently viewed
    setRecentlyViewed(getRecentlyViewed(8));
  }, []);

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

  const itemsToDisplay = allItems.length > 0 ? allItems : items;

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
              <p style={{ fontSize: '1.1rem', color: '#666666', marginBottom: 24 }}>
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
          {itemsToDisplay && itemsToDisplay.length > 0 ? (
            itemsToDisplay.map((item, index) => (
              <Col md={3} key={`${item.slug}-${index}`}>
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
        {loadingMore && (
          <Row>
            <Col>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="skeleton" style={{ height: '400px', borderRadius: '12px', marginBottom: '16px' }}></div>
              </div>
            </Col>
          </Row>
        )}
        {!hasMore && itemsToDisplay.length > 0 && (
          <Row>
            <Col>
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>Đã hiển thị tất cả truyện</p>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default Home;