// App.tsx
import React from 'react';
import { Monitor, Terminal, Users } from 'lucide-react';
import './index.css'; 

export default function BrainrotLanding() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="w-8 h-8" />
            <span className="text-xl font-bold">Brainrot 🧠</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-purple-400">Docs</a>
            <a href="#" className="hover:text-purple-400">Community</a>
            <a
              href="https://github.com/araujo88/brainrot"
              className="hover:text-purple-400"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">No Cap, Just Pure Rizz 🔥</h1>
          <p className="text-xl mb-8">
            The most bussin' programming language that'll have your code
            absolutely based!
          </p>
          <div className="space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg">
              Get Started
            </button>
            <button className="border border-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg">
              Try Online
            </button>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="container mx-auto py-16 px-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <h3 className="text-xl mb-4">Your First Brainrot Program (fr fr no cap)</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`skibidi main {
    yapping("sheeeesh! World! 🔥");
    bussin 0;  // return but make it lit
}`}
            </code>
          </pre>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Monitor className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">Based Syntax</h3>
            <p>No mid code here! Replace boring keywords with absolute bangers:</p>
            <ul className="mt-2 space-y-1 text-gray-300">
              <li>void → skibidi</li>
              <li>int → rizz</li>
              <li>return → bussin</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <Terminal className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">Chad Features</h3>
            <p>Built different with that sigma grindset:</p>
            <ul className="mt-2 space-y-1 text-gray-300">
              <li>Built-in meme references</li>
              <li>Error messages that don't make you cry</li>
              <li>VSCode support (no cap)</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <Users className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">Absolutely Goated Community</h3>
            <p>Join the squad:</p>
            <ul className="mt-2 space-y-1 text-gray-300">
              <li>Discord server full of gigachads</li>
              <li>GitHub contributors on that grind</li>
              <li>Weekly meme updates (real)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Installation */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Get That Bread 🍞</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="mb-4">Install Brainrot (it's giving terminal vibes):</p>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`# No cap, just paste this
git clone https://github.com/araujo88/brainrot.git
cd brainrot
make  # Compilation go brrrrr`}
            </code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">Made with 💀 by the most unhinged developers</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-purple-400">Discord</a>
            <a href="#" className="hover:text-purple-400">Twitter</a>
            <a href="#" className="hover:text-purple-400">GitHub</a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            © 2024 Brainrot - No thoughts, just vibes
          </p>
        </div>
      </footer>
    </div>
  );
}
