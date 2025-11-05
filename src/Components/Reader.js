import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import axios from 'axios';

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
  const [prefetchNext, setPrefetchNext] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [computedPrev, setComputedPrev] = useState('');
  const [computedNext, setComputedNext] = useState('');

  const fetchChapter = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(api);
      setData(res.data);
    } catch (e) {
      setError(e.message);
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

  // Compute prev/next whenever api or chapters change
  useEffect(() => {
    if (!api || !chapters.length) return;
    const idx = chapters.findIndex((c) => c.chapter_api_data === api);
    setComputedPrev(idx > 0 ? chapters[idx - 1].chapter_api_data : '');
    setComputedNext(idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1].chapter_api_data : '');
  }, [api, chapters]);

  // Restore scroll position for this chapter
  useEffect(() => {
    const key = `reader-scroll:${api}`;
    const y = Number(localStorage.getItem(key) || 0);
    if (y > 0) {
      window.scrollTo(0, y);
    }
    const onScroll = () => {
      localStorage.setItem(key, String(window.scrollY));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [api]);

  // Keyboard navigation: Left = prev, Right = next
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' && computedPrev) {
        e.preventDefault();
        setSearchParams((p) => {
          const n = new URLSearchParams(p);
          n.set('api', computedPrev);
          // prev/next become relative to the new api; keep existing if provided in URL
          return n;
        });
      } else if (e.key === 'ArrowRight' && computedNext) {
        e.preventDefault();
        setSearchParams((p) => {
          const n = new URLSearchParams(p);
          n.set('api', computedNext);
          return n;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [computedPrev, computedNext, setSearchParams]);

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

  if (!api) return <p>Thiếu tham số chapter api.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const chapter = data?.data?.item;
  const cdn = data?.data?.domain_cdn;

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
        <div style={{ marginBottom: 20 }}>
          <div className="hero-section" style={{ padding: '16px', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {chapter?.comic_name}
            </h3>
            <p style={{ color: 'rgba(228, 230, 235, 0.8)', margin: 0, fontSize: '1.1rem' }}>
              {chapter?.chapter_name?.toString().startsWith('Ch') ? chapter?.chapter_name : `Chương ${chapter?.chapter_name}`}
            </p>
          </div>
        </div>
        <div className="chapter-container">
          {chapter?.chapter_image?.length ? (
            chapter.chapter_image.map((img, idx) => (
              <LazyLoadImage
                key={idx}
                src={`${cdn}/${chapter.chapter_path}/${img.image_file}`}
                alt={`Page ${idx + 1}`}
                effect="blur"
                onError={onImgErrorRetry}
                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
              />
            ))
          ) : (
            <p>No images.</p>
          )}
        </div>
        {/* Spacer to prevent overlap with toolbar */}
        <div style={{ height: 70 }} />
      </Container>

      {/* Sticky footer toolbar */}
      <div className="reader-toolbar">
        <div className="reader-toolbar-inner">
          <Button as={Link} to="/" variant="dark" size="sm">Trang chủ</Button>
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
          <Button variant="dark" size="sm" disabled>Theo dõi</Button>
        </div>
      </div>
    </>
  );
};

export default Reader;


