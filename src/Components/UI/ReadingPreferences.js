import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useReadingPreferences } from '../../contexts/ReadingPreferencesContext';

const ReadingPreferences = () => {
  const { preferences, updatePreferences } = useReadingPreferences();
  const [show, setShow] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    updatePreferences(localPrefs);
    setShow(false);
  };

  const handleReset = () => {
    const defaults = {
      fontSize: 16,
      readingMode: 'vertical',
      brightness: 100,
      autoScroll: false,
      autoScrollSpeed: 50
    };
    setLocalPrefs(defaults);
    updatePreferences(defaults);
  };

  return (
    <>
      <Button
        variant="outline-light"
        onClick={() => setShow(true)}
        style={{
          minWidth: '40px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent',
        }}
        title="Cài đặt đọc"
      >
        ⚙️
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cài đặt đọc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Kích thước chữ: {localPrefs.fontSize}px</Form.Label>
              <Form.Range
                min="12"
                max="24"
                value={localPrefs.fontSize}
                onChange={(e) => setLocalPrefs({ ...localPrefs, fontSize: parseInt(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Độ sáng: {localPrefs.brightness}%</Form.Label>
              <Form.Range
                min="50"
                max="100"
                value={localPrefs.brightness}
                onChange={(e) => setLocalPrefs({ ...localPrefs, brightness: parseInt(e.target.value) })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chế độ đọc</Form.Label>
              <Form.Select
                value={localPrefs.readingMode}
                onChange={(e) => setLocalPrefs({ ...localPrefs, readingMode: e.target.value })}
              >
                <option value="vertical">Cuộn dọc</option>
                <option value="horizontal">Cuộn ngang</option>
                <option value="pagination">Từng trang</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Tự động cuộn"
                checked={localPrefs.autoScroll}
                onChange={(e) => setLocalPrefs({ ...localPrefs, autoScroll: e.target.checked })}
              />
            </Form.Group>

            {localPrefs.autoScroll && (
              <Form.Group className="mb-3">
                <Form.Label>Tốc độ cuộn: {localPrefs.autoScrollSpeed}%</Form.Label>
                <Form.Range
                  min="10"
                  max="100"
                  value={localPrefs.autoScrollSpeed}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, autoScrollSpeed: parseInt(e.target.value) })}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReadingPreferences;
