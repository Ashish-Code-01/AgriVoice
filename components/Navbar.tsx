import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/20 backdrop-blur-md shadow-lg py-4'
                    : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${scrolled ? 'bg-leaf-600 text-white' : 'bg-white text-leaf-600'}`}>
                            <Leaf className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                            AgriVoice
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Features', 'How it works', 'Stories'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`text-sm font-medium transition-colors hover:text-leaf-400 ${scrolled ? 'text-gray-600' : 'text-white/90'
                                    }`}
                            >
                                {item}
                            </a>
                        ))}
                        <Link
                            to="/sign-in"
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${scrolled
                                    ? 'bg-leaf-600 text-white hover:bg-leaf-700 shadow-md hover:shadow-lg'
                                    : 'bg-white text-leaf-700 hover:bg-earth-50'
                                }`}
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 md:hidden flex flex-col space-y-4 shadow-xl">
                    {['Features', 'How it works', 'Stories', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-gray-600 font-medium hover:text-leaf-600"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item}
                        </a>
                    ))}
                    <Link
                        to="/sign-in"
                        className="w-full text-center py-3 bg-leaf-600 text-white rounded-lg font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
};