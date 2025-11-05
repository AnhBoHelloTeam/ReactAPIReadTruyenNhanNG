import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ErrorState = ({ error, onRetry, title = 'Đã xảy ra lỗi' }) => {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ fontSize: '5rem' }}>⚠️</div>
      <h3 style={{ color: '#1a1a1a', marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: '#666666', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
        {error || 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.'}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            🔄 Thử lại
          </Button>
        )}
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          🏠 Về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
