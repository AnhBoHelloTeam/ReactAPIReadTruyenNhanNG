import React from 'react';
import { Row, Col } from 'react-bootstrap';

export const SkeletonCard = () => {
  return (
    <Col md={3}>
      <div className="skeleton-card skeleton" style={{ marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '12px 12px 0 0' }}></div>
        <div style={{ padding: '16px' }}>
          <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '12px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
        </div>
      </div>
    </Col>
  );
};

export const SkeletonGrid = ({ count = 8 }) => {
  return (
    <Row>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </Row>
  );
};

export default SkeletonGrid;
