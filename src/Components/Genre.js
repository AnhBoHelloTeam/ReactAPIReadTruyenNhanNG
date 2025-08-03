import React, { useEffect, useState } from 'react'
import axios from "axios";
import {Helmet} from "react-helmet";
import {Container, Row, Card, Col, Button, Badge, Pagination} from "react-bootstrap"
import {Link, useParams} from "react-router-dom";
import Menu from './Include/Menu';
const Genre = () => {
  const {slug} = useParams();
  // useTate laf 1 mang lay data
  const [getdata, setData]= useState([]);
  const itemsPerPage = 24;
  const [currentPage, setCurrentPage] = useState(1);
  // ch cs duwx lieu thi hien loading
  const [loading, setLoading]= useState(true);
  const [error, setError]= useState(null);
  const items = getdata?.data?.data?.items;
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        const response = await axios.get(`https://otruyenapi.com/v1/api/the-loai/${slug}?page=${currentPage}`);
        setData(response);
        setLoading(false);
        //console.log(response);
      } catch(error) {
          setError(error.message);
          setLoading(false);
        }
    };
      fetchData();
    },[slug, currentPage]);

    if(loading) return <p>loading...</p>
    if(error) return <p>Error: {error}</p>

    //tinhs toán phân trang 
    const totalItems = getdata?.data?.params?.pagination?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage); // totalItems = ceil(totalItems /24);
    //Handle page change
    const paginate = (pageNumber) =>{
      setCurrentPage(pageNumber);
    };
    return (
      <>
      <Helmet>
        <title>{getdata.data.data.seoOnPage.titleHead}</title>
      </Helmet>
      <Container>
        <Menu></Menu>

        {/* Pagination Controls */}

        <Pagination className="pagination-container">
          {/* Previous Button */}
          <Pagination.Prev
            onClick={() =>  currentPage > 1 && paginate(currentPage -1)}
            disabled= {currentPage === 1}
          />

          {[...Array(totalPages)].map((_, index) =>{
            const pageNumber = index + 1;

            const rangeStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const rangeEnd = Math.min(rangeStart + 4, totalPages);

            if(pageNumber >= rangeStart && pageNumber <= rangeEnd){
              return(
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

          {/* Next Button */}
          <Pagination.Next
            onClick={() =>  currentPage < totalPages && paginate(currentPage +1)}
            disabled= {currentPage === totalPages}
          />
        </Pagination>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{getdata.data.data.seoOnPage.titleHead}</Card.Title>
                {getdata.data.data.seoOnPage.descriptionHead}
              </Card.Body>
            </Card>             
          </Col>
        </Row>
        <Row>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <Col>
                <Card>
                  <Card.Img variant="top" src={`https://img.otruyenapi.com/uploads/comics/${item.thumb_url}`} />
                  <Card.Body>
                    <Card.Title>{item.name || "No Title"}</Card.Title>
                    <Card.Text>{item.updatedAt}</Card.Text>
                    <Card.Text>
                      {item.category && item.category.length > 0 
                        ? item.category.map((category, i) => (
                            <Badge bg="info" key={i}>{category.name}</Badge>
                          ))
                        : "Others"}
                    </Card.Text>
                    <Button variant="primary btn-sm" as={Link} to={`/comics/${item.slug}`}>More Detail</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))  
            ) : (
            <Col>
              <Card.Body>No Content Avaiable</Card.Body>
            </Col>
          )}  
        </Row>
      </Container>
        </>
    );
};

export default Genre;
