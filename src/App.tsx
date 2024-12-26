// App.tsx
import React from 'react';
import './index.css'; 
import Footer from './Footer.tsx';
import Hero from './Hero.tsx';
import Navbar from './Navbar.tsx';
import GetStarted from './GetStarted.tsx';
import Features from './Features.tsx';

const App: React.FC = () => {
  return (
  <div>
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar/>
      <Hero/>
      <Features/>
      <GetStarted/>
      <Footer/>
      </div>
    </div>
  );
};

export default App;