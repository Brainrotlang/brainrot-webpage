// App.tsx
//
// Route table plus the frame every route shares. BrowserRouter itself
// lives in index.tsx so that tests can mount App inside a MemoryRouter and
// drive navigation without touching the real history.
//
// Clean URLs mean static hosting has to fall back to index.html for paths
// that are not files — see nginx.conf for the Docker image and README.md
// for the CloudFront side, which this repository cannot configure.

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './index.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import NotFound from './NotFound';
import { useScrollToHash } from './useScrollToHash';

const App: React.FC = () => {
  useScrollToHash();

  return (
  <div>
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer/>
      </div>
    </div>
  );
};

export default App;
