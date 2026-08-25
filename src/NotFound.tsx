// src/NotFound.tsx
//
// Reached for any URL no route claims. Before routing existed every path
// rendered the landing page, which told a visitor with a stale or mistyped
// link that their link was fine.

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto py-24 px-4 text-center">
      <p className="text-6xl font-bold mb-4">404</p>
      <h1 className="text-3xl font-bold mb-4">This page is not bussin 💀</h1>
      <p className="text-gray-300 mb-8">
        Nothing lives at this URL. Skill issue on somebody's part — could be ours.
      </p>
      <Link
        to="/"
        className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
      >
        Back to the homepage
      </Link>
    </div>
  );
};

export default NotFound;
