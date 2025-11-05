import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline-light"
      onClick={toggleTheme}
      style={{
        minWidth: '40px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent',
      }}
      title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </Button>
  );
};

export default ThemeToggle;
