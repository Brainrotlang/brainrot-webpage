import React from "react";

const GetStarted: React.FC = () => {
return (
<div id="get-started-section">
    <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Get That Bread 🍞</h2>
        <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl mb-4">Install Brainrot (it's giving terminal vibes):</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`# No cap, just paste this
git clone https://github.com/Brainrotlang/brainrot.git
cd brainrot
make  # Compilation go brrrrr`}
            </code>
          </pre>
          <br/>
          <h3 className="text-xl mb-4">Create noobz.brainrot file:</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`touch noobz.brainrot`}
            </code>
          </pre>
          <br/>
          <h3 className="text-xl mb-4">Write Your First Brainrot Program (fr fr no cap):</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`skibidi main {
    yapping("sheeeesh! World! 🔥");
    bussin 0;
}`}
            </code>
          </pre>
          <br/>
          <h3 className="text-xl mb-4">Run!</h3>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-green-400">
{`./brainrot < noobz.brainrot`}
            </code>
          </pre>
        </div>
    </div>
 </div>
);
};

export default GetStarted;