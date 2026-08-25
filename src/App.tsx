// App.tsx
import React from 'react';
import './index.css'; 
import Footer from './Footer';
import Hero from './Hero';
import Navbar from './Navbar';
import GetStarted from './GetStarted';
import Features from './Features';
import Playground from './Playground';

const App: React.FC = () => {
  return (
  <div>
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar/>
      <Hero/>
      <Features/>
      <Playground/>
      <GetStarted/>
      <Footer/>
      </div>
    </div>
  );
};

export default App;