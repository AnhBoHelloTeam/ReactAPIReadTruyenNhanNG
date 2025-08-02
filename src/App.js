import './App.css';
import Home from './Components/Home';
import DetailPage from './Components/DetailPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comics/:slug" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
