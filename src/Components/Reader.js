import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import axios from 'axios';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const Reader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();
  const slug = routeParams.slug || searchParams.get('slug') || '';
  const cidFromRoute = routeParams.cid || '';
  const api = cidFromRoute
    ? `https://sv1.otruyencdn.com/v1/api/chapter/${cidFromRoute}`
    : (searchParams.get('api') || '');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [computedPrev, setComputedPrev] = useState('');
  const [computedNext, setComputedNext] = useState('');

  const fetchChapter = useCallback(async () => {
    if (!api) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(api);
      setData(res.data);
      const cdnFromApi = res.data?.data?.domain_cdn || res.data?.chapter_data?.domain_cdn;
      if (cdnFromApi) {
        localStorage.setItem('last_cdn', cdnFromApi);
      }
    } catch (e) {
      setError(e.message || 'Không thể tải chương truyện');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  // Fetch comic chapters by slug to compute prev/next
  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      try {
        const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        const list = res?.data?.data?.item?.chapters?.[0]?.server_data || [];
        setChapters(list);
      } catch (_) {}
    };
    run();
  }, [slug]);

  // Compute prev/next whenever api or chapters change
  useEffect(() => {
    if (!api || !chapters.length) return;
    const idx = chapters.findIndex((c) => c.chapter_api_data === api);
    setComputedPrev(idx > 0 ? chapters[idx - 1].chapter_api_data : '');
    setComputedNext(idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1].chapter_api_data : '');
  }, [api, chapters]);

  if (!api) {
    return (
      <Container>
        <Menu />
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p>Thiếu tham số chapter api.</p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Menu />
        <SkeletonGrid count={4} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Menu />
        <ErrorState error={error} onRetry={fetchChapter} />
      </Container>
    );
  }

  const chapter = data?.data?.item || data?.chapter_data;
  const cdn = data?.data?.domain_cdn || data?.chapter_data?.domain_cdn || localStorage.getItem('last_cdn') || 'https://sv1.otruyencdn.com';

  if (!chapter) {
    return (
      <Container>
        <Menu />
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p>Không tìm thấy dữ liệu chương truyện</p>
          <Button variant="primary" onClick={() => fetchChapter()} style={{ marginTop: '20px' }}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  const handleGoPrev = () => {
    if (!computedPrev) return;
    const id = (computedPrev || '').split('/').pop();
    if (slug && id) {
      navigate(`/read/${slug}/${id}`);
    } else {
      setSearchParams((p) => {
        const n = new URLSearchParams(p);
        n.set('api', computedPrev);
        return n;
      });
    }
  };

  const handleGoNext = () => {
    if (!computedNext) return;
    const id = (computedNext || '').split('/').pop();
    if (slug && id) {
      navigate(`/read/${slug}/${id}`);
    } else {
      setSearchParams((p) => {
        const n = new URLSearchParams(p);
        n.set('api', computedNext);
        return n;
      });
    }
  };

  const onImgErrorRetry = (e) => {
    const el = e?.target;
    if (!el) return;
    const current = Number(el.getAttribute('data-retry') || 0);
    if (current >= 2) {
      el.style.display = 'none';
      return;
    }
    el.setAttribute('data-retry', String(current + 1));
    const url = new URL(el.src);
    url.searchParams.set('r', String(Date.now()));
    el.src = url.toString();
  };

  return (
    <>
      <Helmet>
        <title>{chapter?.comic_name ? `${chapter.comic_name} - ${chapter?.chapter_name}` : 'Reader'}</title>
      </Helmet>
      <Container>
        <Menu />
        <div style={{ marginBottom: 24 }}>
          <div className="hero-section" style={{ padding: '24px', marginBottom: 20 }}>
            <h3 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              marginBottom: 12, 
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.3'
            }}>
              {chapter?.comic_name}
            </h3>
            <p style={{ 
              color: 'var(--text-primary)', 
              margin: 0, 
              fontSize: '1.2rem', 
              fontWeight: 600,
              letterSpacing: '0.3px'
            }}>
              {chapter?.chapter_name?.toString().startsWith('Ch') ? chapter?.chapter_name : `Chương ${chapter?.chapter_name}`}
            </p>
          </div>
        </div>
        <div className="chapter-container">
          {chapter?.chapter_image?.length ? (
            chapter.chapter_image.map((img, idx) => {
              const imageUrl = `${cdn}/${chapter.chapter_path}/${img.image_file}`;
              return (
                <LazyLoadImage
                  key={idx}
                  src={imageUrl}
                  alt={`Page ${idx + 1}`}
                  effect="blur"
                  onError={onImgErrorRetry}
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
                  }}
                />
              );
            })
          ) : (
            <p>No images.</p>
          )}
        </div>
        {/* Spacer to prevent overlap with toolbar */}
        <div style={{ height: 70 }} />
      </Container>

      {/* Simple footer toolbar */}
      <div className="reader-toolbar">
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div className="reader-toolbar-inner">
            <Button as={Link} to="/" variant="dark" size="sm">Trang chủ</Button>
            <Button variant="secondary" size="sm" disabled={!computedPrev} onClick={handleGoPrev}>
              ← Trước
            </Button>
            <Form.Select
              size="sm"
              value={api}
              onChange={(e) => {
                const targetApi = e.target.value;
                const id = (targetApi || '').split('/').pop();
                if (slug && id) {
                  navigate(`/read/${slug}/${id}`);
                } else {
                  setSearchParams((p) => {
                    const n = new URLSearchParams(p);
                    n.set('api', targetApi);
                    return n;
                  });
                }
              }}
              style={{ maxWidth: 240 }}
            >
              {chapters.map((c, i) => (
                <option key={i} value={c.chapter_api_data}>
                  {c.chapter_name?.toString().startsWith('Ch') ? c.chapter_name : `Chương ${c.chapter_name}`}
                </option>
              ))}
            </Form.Select>
            <Button variant="secondary" size="sm" disabled={!computedNext} onClick={handleGoNext}>
              Sau →
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reader;
