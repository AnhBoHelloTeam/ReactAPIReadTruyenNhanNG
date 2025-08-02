import React, { useEffect, useState } from 'react'
import axios from "axios";
import {Helmet} from "react-helmet";
import {Container, Row, Card, Col, Button, Badge} from "react-bootstrap"
import {Link} from "react-router-dom";
const Home = () => {
  // useTate laf 1 mang lay data
  const [getdata, setData]= useState([]);
  // ch cs duwx lieu thi hien loading
  const [loading, setLoading]= useState(true);
  const [error, setError]= useState(null);
  const items = getdata?.data?.data?.items;
  useEffect(()=>{
    const fetchData = async() =>{
      try{
        const response = await axios.get("https://otruyenapi.com/v1/api/home");
        setData(response);
        setLoading(false);
        console.log(response);
      } catch(error) {
          setError(error.message);
          setLoading(false);
        }
    };
      fetchData();
    },[]);

    if(loading) return <p>loading...</p>
    if(error) return <p>Error: {error}</p>
    return (
      <>
      <Helmet>
        <title>{getdata.data.data.seoOnPage.titleHead}</title>
      </Helmet>
      <Container>
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

export default Home;
