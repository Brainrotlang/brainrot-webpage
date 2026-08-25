import React from "react";
import { Link } from "react-router-dom";
import { LESSON_COUNT } from "./tour/lessonCount";

const Hero: React.FC = () => {
    return (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">No Cap, Just Pure Rizz 🔥</h1>
          <p className="text-xl mb-8">
            The most bussin' programming language that'll have your code
            absolutely based! 🗿
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {/* The tour is the better first click for anyone who has not met
                the language yet, so it leads. */}
            <Link
              to="/tour"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
            >
              Take the Tour 🧠
            </Link>
            <button
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
            onClick={() => {
                const section = document.getElementById("get-started-section");
                section?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            {LESSON_COUNT} lessons, all runnable in this tab. Nothing to install.
          </p>
        </div>
      </div>
    );
 };

export default Hero;
