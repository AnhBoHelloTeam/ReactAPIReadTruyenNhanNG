import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import axios from 'axios';
import { saveReadingProgress, getReadingProgress } from '../utils/readingProgress';
import { useReadingPreferences } from '../contexts/ReadingPreferencesContext';
import ReadingPreferences from './UI/ReadingPreferences';
import BookmarkButton from './UI/BookmarkButton';
import { shareChapter } from '../utils/bookmarks';
import { preloadImages } from '../utils/imageCache';
import Comments from './UI/Comments';
import SkeletonGrid from './UI/SkeletonLoader';
import ErrorState from './UI/ErrorState';

const Reader = () => {
  const { preferences } = useReadingPreferences();
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
  const [prefetchNext, setPrefetchNext] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [computedPrev, setComputedPrev] = useState('');
  const [computedNext, setComputedNext] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const scrollIntervalRef = useRef(null);

  const fetchChapter = useCallback(async () => {
    if (!api) return;
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

  // Fetch comic chapters by slug to compute stable prev/next
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!slug) return;
      try {
        const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
        if (!cancelled) {
          const list = res?.data?.data?.item?.chapters?.[0]?.server_data || [];
          setChapters(list);
        }
      } catch (_) {}
    };
    run();
    return () => { cancelled = true; };
  }, [slug]);

  // Prefetch next chapter images
  useEffect(() => {
    if (!data || !computedNext) return;
    const currentCdn = data?.data?.domain_cdn || data?.chapter_data?.domain_cdn || localStorage.getItem('last_cdn') || 'https://sv1.otruyencdn.com';
    
    const prefetchNextChapter = async () => {
      try {
        const nextRes = await axios.get(computedNext);
        const nextChapter = nextRes?.data?.data?.item || nextRes?.data?.chapter_data;
        if (nextChapter?.chapter_image && nextChapter.chapter_image.length > 0) {
          const imageUrls = nextChapter.chapter_image
            .slice(0, 5) // Prefetch first 5 images
            .map(img => `${currentCdn}/${nextChapter.chapter_path}/${img.image_file}`);
          preloadImages(imageUrls);
        }
      } catch (e) {
        console.error('Error prefetching next chapter', e);
      }
    };
    
    const timer = setTimeout(prefetchNextChapter, 2000);
    return () => clearTimeout(timer);
  }, [data, computedNext]);

  // Compute prev/next whenever api or chapters change
  useEffect(() => {
    if (!api || !chapters.length) return;
    const idx = chapters.findIndex((c) => c.chapter_api_data === api);
    setComputedPrev(idx > 0 ? chapters[idx - 1].chapter_api_data : '');
    setComputedNext(idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1].chapter_api_data : '');
  }, [api, chapters]);

  // Restore scroll position and track reading progress
  useEffect(() => {
    if (!api || !data || !slug) return;
    const chapterId = cidFromRoute || api.split('/').pop();
    const key = `reader-scroll:${api}`;
    const savedProgress = getReadingProgress(slug, chapterId);
    setReadingProgress(savedProgress);
    
    const y = Number(localStorage.getItem(key) || 0);
    if (y > 0) {
      window.scrollTo(0, y);
    }
    
    const onScroll = () => {
      localStorage.setItem(key, String(window.scrollY));
      
      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? Math.round((scrollTop / scrollableHeight) * 100) : 0;
      
      setReadingProgress(progress);
      saveReadingProgress(slug, chapterId, progress);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [api, data, slug, cidFromRoute]);

  // Keyboard navigation: Left = prev, Right = next, Space = scroll, Home = top, End = bottom
  useEffect(() => {
    const onKey = (e) => {
      // Prevent default when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      
      if (e.key === 'ArrowLeft' && computedPrev) {
        e.preventDefault();
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
      } else if (e.key === 'ArrowRight' && computedNext) {
        e.preventDefault();
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
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        // Toggle auto scroll
        setAutoScrollEnabled(prev => !prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else if (e.key === 'Escape') {
        // Stop auto scroll
        if (autoScrollEnabled) {
          setAutoScrollEnabled(false);
          if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [computedPrev, computedNext, slug, navigate, setSearchParams, autoScrollEnabled]);

  // Simple prefetch for next chapter images
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      if (!computedNext) return;
      try {
        const res = await axios.get(computedNext);
        if (aborted) return;
        setPrefetchNext(res.data);
        const nItem = res.data?.data?.item;
        const nCdn = res.data?.data?.domain_cdn;
        (nItem?.chapter_image || []).slice(0, 3).forEach((img) => {
          const pre = new Image();
          pre.src = `${nCdn}/${nItem.chapter_path}/${img.image_file}`;
        });
      } catch (_) {}
    };
    run();
    return () => { aborted = true; };
  }, [computedNext]);

  const chapter = data?.data?.item || data?.chapter_data;
  const cdn = data?.data?.domain_cdn || data?.chapter_data?.domain_cdn || localStorage.getItem('last_cdn') || 'https://sv1.otruyencdn.com';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ 
                color: 'var(--text-primary)', 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: 600,
                letterSpacing: '0.3px'
              }}>
                {chapter?.chapter_name?.toString().startsWith('Ch') ? chapter?.chapter_name : `Chương ${chapter?.chapter_name}`}
              </p>
              {readingProgress > 0 && (
                <div style={{ 
                  padding: '8px 16px', 
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  letterSpacing: '0.3px'
                }}>
                  Đã đọc: {readingProgress}%
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="chapter-container"
          style={{
            fontSize: `${preferences.fontSize}px`,
            filter: `brightness(${preferences.brightness}%)`,
            display: preferences.readingMode === 'horizontal' ? 'flex' : 'block',
            overflowX: preferences.readingMode === 'horizontal' ? 'auto' : 'visible',
            flexDirection: preferences.readingMode === 'horizontal' ? 'row' : 'column',
            gap: preferences.readingMode === 'horizontal' ? '10px' : '0'
          }}
        >
          {chapter?.chapter_image?.length ? (
            chapter.chapter_image.map((img, idx) => {
              const imageUrl = `${cdn}/${chapter.chapter_path}/${img.image_file}`;
              return (
                <div key={idx} style={{ position: 'relative' }}>
                  <LazyLoadImage
                    src={imageUrl}
                    alt={`Page ${idx + 1}`}
                    effect="blur"
                    onError={onImgErrorRetry}
                    style={{ 
                      width: preferences.readingMode === 'horizontal' ? 'auto' : '100%',
                      height: preferences.readingMode === 'horizontal' ? '100vh' : 'auto',
                      marginBottom: preferences.readingMode === 'horizontal' ? '0' : '10px',
                      objectFit: preferences.readingMode === 'horizontal' ? 'contain' : 'cover'
                    }}
                  />
                  <BookmarkButton
                    slug={slug}
                    chapterId={cidFromRoute || api.split('/').pop()}
                    currentPage={idx + 1}
                    imageUrl={imageUrl}
                  />
                </div>
              );
            })
          ) : (
            <p>No images.</p>
          )}
        </div>
        {/* Spacer to prevent overlap with toolbar */}
        <div style={{ height: 70 }} />
      </Container>

      {/* Sticky footer toolbar */}
      <div className="reader-toolbar">
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          {/* Progress bar */}
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '2px', 
            marginBottom: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${readingProgress}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              transition: 'width 0.3s ease',
              borderRadius: '2px'
            }} />
          </div>
          <div className="reader-toolbar-inner">
            <Button as={Link} to="/" variant="dark" size="sm">Trang chủ</Button>
            <ReadingPreferences />
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => shareChapter(slug, cidFromRoute || api.split('/').pop(), chapter?.chapter_name || '')}
              title="Chia sẻ chapter"
            >
              🔗
            </Button>
            <Comments slug={slug} chapterId={cidFromRoute || api.split('/').pop()} />
            <Button 
              variant={autoScrollEnabled ? "success" : "outline-light"} 
              size="sm" 
              onClick={() => {
                if (autoScrollEnabled) {
                  // Stop auto scroll
                  if (scrollIntervalRef.current) {
                    clearInterval(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                  }
                  setAutoScrollEnabled(false);
                } else {
                  // Start auto scroll
                  setAutoScrollEnabled(true);
                  const scrollSpeed = (preferences.autoScrollSpeed || 50) / 100;
                  scrollIntervalRef.current = setInterval(() => {
                    window.scrollBy(0, 1 * scrollSpeed);
                  }, 10);
                }
              }}
            >
              {autoScrollEnabled ? '⏸️' : '▶️'}
            </Button>
            <Button variant="secondary" size="sm" disabled={!computedPrev} onClick={handleGoPrev}>← Trước</Button>
            <Form.Select
              size="sm"
              value={api}
              onChange={(e) => {
                const targetApi = e.target.value;
                const id = (targetApi || '').split('/').pop();
                if (slug && id) navigate(`/read/${slug}/${id}`);
                else {
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
            <Button variant="secondary" size="sm" disabled={!computedNext} onClick={handleGoNext}>Sau →</Button>
            <div style={{ 
              padding: '4px 12px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {readingProgress}%
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reader;


