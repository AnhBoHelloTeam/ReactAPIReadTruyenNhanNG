import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import axios from 'axios';

const Reader = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = searchParams.get('api') || '';
  const prevApi = searchParams.get('prev') || '';
  const nextApi = searchParams.get('next') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prefetchNext, setPrefetchNext] = useState(null);

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
      if (e.key === 'ArrowLeft' && prevApi) {
        e.preventDefault();
        setSearchParams((p) => {
          const n = new URLSearchParams(p);
          n.set('api', prevApi);
          // prev/next become relative to the new api; keep existing if provided in URL
          return n;
        });
      } else if (e.key === 'ArrowRight' && nextApi) {
        e.preventDefault();
        setSearchParams((p) => {
          const n = new URLSearchParams(p);
          n.set('api', nextApi);
          return n;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevApi, nextApi, setSearchParams]);

  // Simple prefetch for next chapter images if nextApi provided
  useEffect(() => {
    let aborted = false;
    const run = async () => {
      if (!nextApi) return;
      try {
        const res = await axios.get(nextApi);
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
  }, [nextApi]);

  if (!api) return <p>Thiếu tham số chapter api.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const chapter = data?.data?.item;
  const cdn = data?.data?.domain_cdn;

  const handleGoPrev = () => {
    if (!prevApi) return;
    setSearchParams((p) => {
      const n = new URLSearchParams(p);
      n.set('api', prevApi);
      return n;
    });
  };

  const handleGoNext = () => {
    if (!nextApi) return;
    setSearchParams((p) => {
      const n = new URLSearchParams(p);
      n.set('api', nextApi);
      return n;
    });
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
        <div style={{ margin: '10px 0', display: 'flex', gap: 8 }}>
          <Button as={Link} to={-1}>Quay lại</Button>
          <Button variant="secondary" disabled={!prevApi} onClick={handleGoPrev}>← Chapter trước</Button>
          <Button variant="secondary" disabled={!nextApi} onClick={handleGoNext}>Chapter sau →</Button>
        </div>
        <h5 style={{ marginBottom: 10 }}>
          {chapter?.comic_name} - {chapter?.chapter_name}
        </h5>
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
      </Container>
    </>
  );
};

export default Reader;


