import './App.css';
import Home from './Components/Home';
import DetailPage from './Components/DetailPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Genre from './Components/Genre';
import Trending from './Components/Trending';
import Search from './Components/Search';
import History from './Components/History'; // Import History
import Reader from './Components/Reader';
import Author from './Components/Author';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comics/:slug" element={<DetailPage />} />
        <Route path="/genre/:slug" element={<Genre />} />
        <Route path="/trending/:slug" element={<Trending />} />
        <Route path="/search" element={<Search />} />
        <Route path="/history" element={<History />} />
        <Route path="/read" element={<Reader />} />
        <Route path="/author/:slug" element={<Author />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;