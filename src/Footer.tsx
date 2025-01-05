import React from "react";

const Footer: React.FC = () => {
return (
    <div>
        <footer className="bg-gray-800 py-8">
            <div className="container mx-auto px-4 text-center">
            <p className="mb-4">Made with 💀 by the most unhinged developers 🧟</p>
            <div className="flex justify-center space-x-6">
                <a href="https://discord.gg/G9BqwB3a" className="hover:text-purple-400">Discord</a>
                <a href="https://github.com/Brainrotlang/brainrot" className="hover:text-purple-400">GitHub</a>
                <a href="https://x.com/brainrotlang" className="hover:text-purple-400">Xwitter</a>
            </div>
            <p className="mt-6 text-sm text-gray-400">
                © 2024 Brainrot - No thoughts, just vibes
            </p>
            </div>
        </footer>
    </div>
    );
};

export default Footer;

