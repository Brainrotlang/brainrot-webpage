import React from "react";

const Hero: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">No Cap, Just Pure Rizz 🔥</h1>
          <p className="text-xl mb-8">
            The most bussin' programming language that'll have your code
            absolutely based!
          </p>
          <div className="space-x-4">
            <button 
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
            onClick={() => {
                const section = document.getElementById("get-started-section");
                section?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
 };
    
export default Hero;