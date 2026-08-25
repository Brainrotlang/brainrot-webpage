import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

const Navbar: React.FC = () => {
    return (
        <div>
            <nav className="bg-gray-800 p-4">
                <div className="container mx-auto flex flex-wrap justify-between items-center gap-y-3">
                    {/* The navbar frames every route now, so the brand has to
                        be a way back to the homepage — from a 404 or a deep
                        route there is otherwise none. */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Terminal className="w-8 h-8" />
                        <span className="text-xl font-bold">Brainrot 🧠</span>
                    </Link>
                    <div className="flex flex-wrap justify-end gap-x-6 gap-y-2">
                        {/* A bare "#playground" would resolve against whatever
                            route is current, and only "/" has that section.
                            The leading "/" makes it navigate home first;
                            useScrollToHash then does the scrolling React
                            Router deliberately leaves alone. */}
                        <Link to="/#playground" className="hover:text-purple-400">Playground</Link>
                        {/* Tour teaches the language, Docs is for looking it
                            up — hence this order, and hence both. */}
                        <Link to="/tour" className="hover:text-purple-400">Tour</Link>
                        <a href="https://github.com/Brainrotlang/brainrot/tree/main/docs" className="hover:text-purple-400">Docs</a>
                        <a href="https://discord.gg/FjHhvBHSGj" className="hover:text-purple-400">Discord</a>
                        <a
                        href="https://github.com/Brainrotlang/brainrot"
                        className="hover:text-purple-400"
                        >
                        GitHub
                        </a>
                        <a
                        href="https://x.com/brainrotlang"
                        className="hover:text-purple-400"
                        >
                        Xwitter
                        </a>
                        <a
                        href="https://www.reddit.com/r/Brainrotlang" 
                        className="hover:text-purple-400"
                        >
                        Subreddit
                        </a>
                    </div>
                </div>
            </nav>
        </div>    
    );
};

export default Navbar;
