// src/Home.tsx
//
// The landing page's own sections, split out of App.tsx when routing
// arrived. Navbar and Footer deliberately stayed behind in App.tsx: they
// frame every route, not just this one.

import React from 'react';
import Hero from './Hero';
import Features from './Features';
import Playground from './Playground';
import GetStarted from './GetStarted';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Features />
      <Playground />
      <GetStarted />
    </>
  );
};

export default Home;
