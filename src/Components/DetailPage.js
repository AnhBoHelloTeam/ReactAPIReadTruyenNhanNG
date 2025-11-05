import { apiClient } from '../api/client';
import { getThumbUrl, onImageErrorHide } from '../utils/image';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, ListGroup, Modal, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Menu from './Include/Menu';

const DetailPage = () => {
  const { slug } = useParams();
  const [getdata, setData] = useState([]);
  const [getDataChapter, setDataChapter] = useState([]);
  const [relatedComics, setRelatedComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
        <Button as={Link} to="/">Back to Home</Button>
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{getdata.data.data.seoOnPage.titleHead}</Card.Title>
                <Card.Text>{getdata.data.data.seoOnPage.descriptionHead}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Card style={{ width: '100%' }}>
              <LazyLoadImage
                src={getThumbUrl(item?.thumb_url)}
                alt={item?.name}
                effect="blur"
                onError={onImageErrorHide}
                style={{ width: '100%', height: 'auto' }}
              />
              <Card.Body>
                <Card.Title>{item?.name || 'No Title'}</Card.Title>
                <Card.Title dangerouslySetInnerHTML={{ __html: item?.content }} />
                <Card.Text>{item?.updatedAt}</Card.Text>
                <Card.Text>{item?.status}</Card.Text>
                <Card.Text>
                  {item?.category && item.category.length > 0
                    ? item.category.map((category, index) => (
                        <Badge bg="info" key={index}>
                          {category.name}
                        </Badge>
                      ))
                    : 'Others'}
                </Card.Text>
                <Card.Text>
                  {item?.author && item.author.length > 0
                    ? item.author.map((author, index) => (
                        <Badge bg="info" key={index} as={Link} to={`/author/${author.slug}`} style={{ cursor: 'pointer' }}>
                          {author.name}
                        </Badge>
                      ))
                    : 'Others'}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card>
              <ListGroup className="scrollable-list">
                {item?.chapters && item.chapters.length > 0 ? (
                  item.chapters.map((chapter, index) => (
                    <div key={index}>
                      <h5>{chapter.server_name}</h5>
                      <ListGroup.Item>
                        {chapter.server_data && chapter.server_data.length > 0 ? (
                          chapter.server_data.map((listchapter, subIndex) => {
                            const prevApi = chapter.server_data[subIndex - 1]?.chapter_api_data;
                            const nextApi = chapter.server_data[subIndex + 1]?.chapter_api_data;
                            const href = `/read?api=${encodeURIComponent(listchapter.chapter_api_data)}${prevApi ? `&prev=${encodeURIComponent(prevApi)}` : ''}${nextApi ? `&next=${encodeURIComponent(nextApi)}` : ''}`;
                            return (
                              <Link
                                className="chapter_click"
                                key={subIndex}
                                to={href}
                              >
                                Chapter: {listchapter.chapter_name}
                              </Link>
                            );
                          })
                        ) : (
                          <span>Chapters is coming soon...</span>
                        )}
                      </ListGroup.Item>
                    </div>
                  ))
                ) : (
                  <span>Chapters is coming soon...</span>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Truyện liên quan</h3>
            <Row>
              {relatedComics.length > 0 ? (
                relatedComics.map((comic, index) => (
                  <Col md={3} key={index}>
                    <Card>
                      <LazyLoadImage
                        src={getThumbUrl(comic.thumb_url)}
                        alt={comic.name}
                        effect="blur"
                        onError={onImageErrorHide}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Card.Body>
                        <Card.Title>{comic.name}</Card.Title>
                        <Button as={Link} to={`/comics/${comic.slug}`}>
                          More Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <p>Không có truyện liên quan</p>
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