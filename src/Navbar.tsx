import React from 'react';
import { Terminal } from 'lucide-react';

const Navbar: React.FC = () => {
    return (
        <div>
            <nav className="bg-gray-800 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-8 h-8" />
                        <span className="text-xl font-bold">Brainrot 🧠</span>
                    </div>
                    <div className="flex space-x-6">
                        <a href="https://github.com/Brainrotlang/brainrot/tree/main/docs" className="hover:text-purple-400">Docs</a>
                        <a href="https://discord.com/channels/1321786173349298176/1321786173781184532" className="hover:text-purple-400">Community</a>
                        <a
                        href="https://github.com/Brainrotlang/brainrot"
                        className="hover:text-purple-400"
                        >
                        GitHub
                        </a>
                    </div>
                </div>
            </nav>
        </div>    
    );
};

export default Navbar;