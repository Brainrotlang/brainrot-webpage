import React from "react";
import { Monitor, Terminal, Users } from 'lucide-react';

const Features: React.FC = () => {
return (
<div>
    <div className="container mx-auto py-16 px-4">
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
</div>
);
};

export default Features;