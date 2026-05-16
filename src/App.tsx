import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import BedPage from '@/pages/BedPage';

// HashRouter so QR codes work on GitHub Pages without server config.
// QR code URLs look like: https://pranavchokda.github.io/oudolf-garden/#/bed/bed-01

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bed/:bedId" element={<BedPage />} />
      </Routes>
    </HashRouter>
  );
}
