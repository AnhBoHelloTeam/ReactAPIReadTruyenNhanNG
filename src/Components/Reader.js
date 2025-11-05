import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';
import { apiClient } from '../api/client';

const Reader = () => {
  const [searchParams] = useSearchParams();
  const api = searchParams.get('api') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChapter = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const path = api.replace('/v1/api', '');
      const res = await apiClient.get(path);
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

  if (!api) return <p>Thiếu tham số chapter api.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const chapter = data?.data?.item;
  const cdn = data?.data?.domain_cdn;

  return (
    <>
      <Helmet>
        <title>{chapter?.comic_name ? `${chapter.comic_name} - ${chapter?.chapter_name}` : 'Reader'}</title>
      </Helmet>
      <Container>
        <Menu />
        <div style={{ margin: '10px 0' }}>
          <Button as={Link} to={-1}>Quay lại</Button>
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


