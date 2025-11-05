import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Modal, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import { addFavorite, removeFavorite, isFavorite } from '../utils/favorites';
import ComicCard from './UI/ComicCard';
import SectionTitle from './UI/SectionTitle';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const DetailPage = () => {
  const { slug } = useParams();
  const [getdata, setData] = useState([]);
  const [getDataChapter, setDataChapter] = useState([]);
  const [relatedComics, setRelatedComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const [descOrder, setDescOrder] = useState(true);
  const item = getdata?.data?.data?.item;

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiClient.get(`/truyen-tranh/${slug}`);
      setData(response);
      setLoading(false);
      // Lưu lịch sử đọc
      if (response.data.data.item) {
        const comic = response.data.data.item;
        setFav(isFavorite(comic.slug));
        const history = JSON.parse(localStorage.getItem('readingHistory')) || [];
        const updatedHistory = [
          {
            slug: comic.slug,
            name: comic.name,
            thumb_url: comic.thumb_url,
            lastChapter: comic.chapters[0]?.server_data[0]?.chapter_name,
          },
          ...history.filter((item) => item.slug !== comic.slug),
        ].slice(0, 10); // Giới hạn 10 truyện
        localStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  fetchData();
}, [slug]);
  const handleToggleFavorite = () => {
    if (!item) return;
    const comic = {
      slug: item.slug,
      name: item.name,
      thumb_url: item.thumb_url,
      category: item.category || [],
      status: item.status,
      updatedAt: item.updatedAt,
    };
    if (isFavorite(item.slug)) {
      removeFavorite(item.slug);
      setFav(false);
    } else {
      addFavorite(comic);
      setFav(true);
    }
  };

  // Lấy truyện liên quan
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const categorySlug = item?.category[0]?.slug;
        if (categorySlug) {
          const response = await apiClient.get(`/the-loai/${categorySlug}`);
          setRelatedComics(response.data.data.items.slice(0, 4)); // Lấy 4 truyện liên quan
        }
      } catch (error) {
        console.error('Error fetching related comics:', error);
      }
    };
    if (item) fetchRelated();
  }, [item]);

  if (loading) {
    return (
      <Container>
        <Menu />
        <Row>
          <Col md={12}>
            <div className="skeleton" style={{ height: '400px', borderRadius: '12px', marginBottom: '24px' }}></div>
          </Col>
        </Row>
        <SkeletonGrid count={4} />
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

  const handleClose = () => setIsModalOpen(false);

  const handleReadChapter = async (chapter_api) => {
    try {
      const response = await apiClient.get(chapter_api.replace('/v1/api', ''));
      setDataChapter(response.data);
      setLoading(false);
      setIsModalOpen(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Chuyển chapter trước/sau
  const handleNextChapter = async () => {
    const currentChapterIndex = item.chapters[0].server_data.findIndex(
      (chapter) => chapter.chapter_api_data === getDataChapter.data.item.chapter_api_data
    );
    const nextChapter = item.chapters[0].server_data[currentChapterIndex - 1];
    if (nextChapter) {
      await handleReadChapter(nextChapter.chapter_api_data);
    }
  };

  const handlePrevChapter = async () => {
    const currentChapterIndex = item.chapters[0].server_data.findIndex(
      (chapter) => chapter.chapter_api_data === getDataChapter.data.item.chapter_api_data
    );
    const prevChapter = item.chapters[0].server_data[currentChapterIndex + 1];
    if (prevChapter) {
      await handleReadChapter(prevChapter.chapter_api_data);
    }
  };

  return (
    <>
      <Helmet>
        <title>{getdata.data.data.seoOnPage.titleHead}</title>
        <meta name="description" content={getdata.data.data.seoOnPage.descriptionHead} />
        <meta
          property="og:image"
          content={`https://img.otruyenapi.com/uploads/comics/${item?.thumb_url}`}
        />
      </Helmet>
      <Container>
        <Menu />
        <div style={{ marginBottom: 20 }}>
          <Button as={Link} to="/" variant="outline-light" size="sm">← Về trang chủ</Button>
        </div>
        {/* Hero Info */}
        <Row style={{ marginBottom: 24 }}>
          <Col>
            <div className="hero-section" style={{ padding: '24px', marginBottom: 0 }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {item?.name || 'No Title'}
              </h1>
              <div style={{ color: '#1a1a1a', marginBottom: 16, lineHeight: '1.6', fontSize: '1rem', fontWeight: 400 }} dangerouslySetInnerHTML={{ __html: item?.content }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Badge bg="secondary" style={{ padding: '6px 12px' }}>{item?.status}</Badge>
                <Badge bg="info" style={{ padding: '6px 12px' }}>{item?.updatedAt}</Badge>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Card className="card-equal-height" style={{ position: 'sticky', top: 80 }}>
              <LazyLoadImage
                className="card-img-top"
                src={getThumbUrl(item?.thumb_url)}
                alt={item?.name}
                effect="blur"
                onError={onImageErrorHide}
                style={{ width: '100%', height: 'auto' }}
              />
              <Card.Body>
                <div style={{ marginBottom: 16 }}>
                  <Button variant={fav ? 'danger' : 'outline-danger'} onClick={handleToggleFavorite} style={{ width: '100%' }}>
                    {fav ? '❤️ Bỏ yêu thích' : '🤍 Yêu thích'}
                  </Button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <small style={{ color: '#e4e6eb', fontWeight: 600, display: 'block', marginBottom: 8 }}>Thể loại:</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item?.category && item.category.length > 0
                      ? item.category.map((category, index) => (
                          <Badge bg="info" key={index} style={{ fontSize: '0.85rem' }}>
                            {category.name}
                          </Badge>
                        ))
                      : <Badge bg="secondary">Others</Badge>}
                  </div>
                </div>
                <div>
                  <small style={{ color: '#e4e6eb', fontWeight: 600, display: 'block', marginBottom: 8 }}>Tác giả:</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item?.author && item.author.length > 0
                      ? item.author.map((author, index) => (
                          <Badge bg="info" key={index} as={Link} to={`/author/${author.slug}`} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                            {author.name}
                          </Badge>
                        ))
                      : <Badge bg="secondary">Others</Badge>}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <SectionTitle style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.25rem' }}>Danh sách chương</SectionTitle>
                <Button size="sm" variant="secondary" onClick={() => setDescOrder((v) => !v)}>
                  {descOrder ? 'Mới → Cũ' : 'Cũ → Mới'}
                </Button>
              </div>
              {(() => {
                const raw = item?.chapters?.[0]?.server_data || [];
                const list = descOrder ? raw : [...raw].reverse();
                return (
                  <div className="chapters-list" style={{ maxHeight: 600 }}>
                    {list.map((c, idx) => {
                      const id = (c.chapter_api_data || '').split('/').pop();
                      const href = `/read/${item.slug}/${id}`;
                      return (
                        <Link key={idx} to={href} className="chapter-row">
                          <span className="chapter-name">{c.chapter_name?.toString().startsWith('Ch') ? c.chapter_name : `Chương ${c.chapter_name}`}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 32 }}>
          <Col>
            <SectionTitle>Truyện liên quan</SectionTitle>
            <Row>
              {relatedComics.length > 0 ? (
                relatedComics.map((comic, index) => (
                  <Col md={3} key={index}>
                    <ComicCard item={comic} />
                  </Col>
                ))
              ) : (
                <Col>
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>Không có truyện liên quan</p>
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {isModalOpen && (
          <Modal show={isModalOpen} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                Chapter {getDataChapter.data.item.chapter_name} -{' '}
                {getDataChapter.data.item.comic_name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="chapter-container">
                {getDataChapter.data.item.chapter_image &&
                getDataChapter.data.item.chapter_image.length > 0 ? (
                  getDataChapter.data.item.chapter_image.map((chapterImage, index) => (
                    <LazyLoadImage
                      key={index}
                      src={`${getDataChapter.data.domain_cdn}/${getDataChapter.data.item.chapter_path}/${chapterImage.image_file}`}
                      alt={`Chapter ${getDataChapter.data.item.chapter_name}`}
                      effect="blur"
                      style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
                    />
                  ))
                ) : (
                  'No Image Loading...'
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={handlePrevChapter}
                disabled={
                  !item.chapters[0].server_data.some(
                    (_, i) =>
                      i >
                      item.chapters[0].server_data.findIndex(
                        (c) => c.chapter_api_data === getDataChapter.data.item.chapter_api_data
                      )
                  )
                }
              >
                Previous Chapter
              </Button>
              <Button
                variant="secondary"
                onClick={handleNextChapter}
                disabled={
                  !item.chapters[0].server_data.some(
                    (_, i) =>
                      i <
                      item.chapters[0].server_data.findIndex(
                        (c) => c.chapter_api_data === getDataChapter.data.item.chapter_api_data
                      )
                  )
                }
              >
                Next Chapter
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </>
  );
};

export default DetailPage;