import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mic, Leaf, TrendingUp, Users, ArrowRight, CheckCircle,
    Smartphone, Zap, Shield, Play, Pause, Activity
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const features = [
    {
        icon: <Mic className="w-6 h-6" />,
        title: "Native Voice Recognition",
        desc: "Speak naturally in Hindi, Spanish, English, or Swahili. We understand agricultural dialects.",
        color: "bg-orange-100 text-orange-600"
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Market Intelligence",
        desc: "Real-time crop prices from local mandis and global markets to maximize your profit.",
        color: "bg-blue-100 text-blue-600"
    },
    {
        icon: <Leaf className="w-6 h-6" />,
        title: "Disease Detection",
        desc: "Describe symptoms or upload a photo. Our AI diagnoses pests and diseases instantly.",
        color: "bg-leaf-100 text-leaf-600"
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Weather Shield",
        desc: "Hyper-local weather alerts that warn you days before a storm or drought hits.",
        color: "bg-purple-100 text-purple-600"
    }
];

export const Home = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="min-h-screen bg-earth-50 font-sans selection:bg-leaf-500 selection:text-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://picsum.photos/1920/1080?grayscale&blur=2"
                        className="w-full h-full object-cover object-center scale-105"
                        alt="Farm background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-leaf-950/95 via-leaf-900/80 to-leaf-900/40"></div>
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Hero Content */}
                    <div className="space-y-8 animate-[fadeIn_1s_ease-out]">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-leaf-200 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-leaf-400 animate-pulse"></span>
                            AI-Powered Farming Assistant
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] font-serif tracking-tight">
                            Grow Better, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-300 to-yellow-200">
                                Just by Speaking.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-earth-100 max-w-xl leading-relaxed">
                            The world's first voice-first agricultural platform. Ask questions, get market prices, and diagnose crop diseases in your local language.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                to="/sign-in"
                                className="group relative inline-flex items-center justify-center px-8 py-4 bg-leaf-500 text-white rounded-full font-semibold overflow-hidden transition-all hover:bg-leaf-400 hover:shadow-[0_0_20px_rgba(26,205,129,0.5)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                <span>Watch Demo</span>
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-8 flex items-center gap-6 text-white/40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="text-sm font-medium">Trusted by 50,000+ Farmers</div>
                            <div className="h-px flex-1 bg-white/10"></div>
                        </div>
                    </div>

                    {/* Hero Visual - Interactive Mockup */}
                    <div className="relative hidden lg:block perspective-1000">
                        <div className="relative mx-auto w-[320px] animate-float">
                            {/* Phone Frame */}
                            <div className="relative z-20 bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-4 border-gray-800 ring-1 ring-white/20">
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-30"></div>

                                {/* Screen Content */}
                                <div className="bg-earth-50 rounded-[2.5rem] h-[600px] overflow-hidden flex flex-col relative">
                                    {/* App Header */}
                                    <div className="bg-leaf-600 p-6 pt-12 text-white rounded-b-3xl shadow-lg z-10">
                                        <div className="flex justify-between items-center mb-4">
                                            <Leaf className="w-6 h-6" />
                                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                        </div>
                                        <p className="text-leaf-100 text-sm">Good Morning,</p>
                                        <h3 className="text-2xl font-serif">Farmer John</h3>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                                        {/* Chat Bubble Left */}
                                        <div className="flex gap-3 animate-[fadeInUp_0.5s_ease-out_1s_both]">
                                            <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center flex-shrink-0">
                                                <Leaf className="w-4 h-4 text-leaf-600" />
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[80%]">
                                                How can I help your harvest today?
                                            </div>
                                        </div>

                                        {/* Chat Bubble Right (User) */}
                                        <div className="flex gap-3 flex-row-reverse animate-[fadeInUp_0.5s_ease-out_2s_both]">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                            </div>
                                            <div className="bg-leaf-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[80%] flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                                <span className="w-16 h-3 bg-white/30 rounded-full"></span>
                                            </div>
                                        </div>

                                        {/* Voice Visualization */}
                                        <div className="absolute bottom-8 left-0 right-0 px-6">
                                            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-earth-100">
                                                <div className="flex items-center gap-1 h-8">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <div key={i} className="w-1 bg-leaf-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                                                    ))}
                                                </div>
                                                <div className="w-12 h-12 bg-leaf-500 rounded-full flex items-center justify-center shadow-lg shadow-leaf-200">
                                                    <Mic className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements around phone */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-leaf-500 rounded-full blur-3xl opacity-20"></div>
                        </div>
                    </div>
                </div>

                {/* Curved Divider */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-earth-50 rounded-t-[50%] scale-x-150 translate-y-12"></div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-leaf-600 font-semibold tracking-wider uppercase text-sm mb-3">Why AgriVoice?</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-6">
                            Modern Technology, <br className="hidden md:block" />Rooted in Agriculture
                        </h3>
                        <p className="text-gray-600 text-lg">
                            We've stripped away the complex interfaces. Just open the app and talk like you're talking to a neighbor.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-100 hover:-translate-y-2"
                            >
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Bento Grid Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                        {/* Large Card */}
                        <div className="md:col-span-2 row-span-2 bg-leaf-950 rounded-[2.5rem] p-10 relative overflow-hidden group text-white">
                            <div className="absolute inset-0 bg-[url('https://picsum.photos/800/800?grayscale')] bg-cover opacity-20 group-hover:scale-105 transition-transform duration-700"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="bg-white/10 backdrop-blur-md w-fit px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">Community</div>
                                    <h3 className="text-4xl font-serif font-bold mb-4">Connect with Experts</h3>
                                    <p className="text-gray-300 max-w-md">Join a network of 50,000+ farmers and certified agronomists. Share photos of your crops and get instant advice.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-4">
                                            <img  src={``} className="w-12 h-12 rounded-full border-2 border-leaf-950" alt="User" />
                                    </div>
                                    <div className="text-sm font-medium text-leaf-300">+42 new today</div>
                                </div>
                            </div>
                        </div>

                        {/* Weather Card */}
                        <div className="bg-blue-50 rounded-[2.5rem] p-8 relative overflow-hidden border border-blue-100 hover:shadow-lg transition-shadow">
                            <div className="absolute top-0 right-0 p-8 opacity-20">
                                <Zap className="w-32 h-32 text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Smart Alerts</h4>
                                <p className="text-sm text-gray-600 mb-6">Get notified before disaster strikes.</p>
                                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Activity className="w-5 h-5" /></div>
                                    <div>
                                        <div className="text-xs text-gray-500">Alert</div>
                                        <div className="text-sm font-bold text-gray-900">Heavy Rain Expected</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scan Card */}
                        <div className="bg-earth-100 rounded-[2.5rem] p-8 relative overflow-hidden border border-earth-200 hover:shadow-lg transition-shadow">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-leaf-200 rounded-full blur-2xl opacity-50"></div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Visual Diagnosis</h4>
                            <p className="text-sm text-gray-600 mb-6">Scan crops with your camera.</p>
                            <div className="w-full h-32 bg-gray-900 rounded-xl relative overflow-hidden group-hover:scale-105 transition-transform">
                                <img src="https://picsum.photos/400/200?random=10" className="w-full h-full object-cover opacity-80" alt="Crop scan" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 border-2 border-white/50 rounded-lg flex items-center justify-center">
                                        <div className="w-8 h-1 bg-white/80 absolute"></div>
                                        <div className="h-8 w-1 bg-white/80 absolute"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Voice Command Card */}
                        <div className="md:col-span-2 bg-gradient-to-br from-leaf-500 to-leaf-600 rounded-[2.5rem] p-8 relative overflow-hidden text-white flex items-center justify-between group">
                            <div className="relative z-10">
                                <h4 className="text-2xl font-serif font-bold mb-2">Just say "Mandi Prices"</h4>
                                <p className="text-leaf-100">Instant access to 500+ market listings nearby.</p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mic className="w-8 h-8 text-white" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Steps / Process */}
            <section id="how-it-works" className="py-24 bg-earth-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">Simple as 1, 2, 3</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-leaf-300 to-transparent border-t-2 border-dashed border-leaf-300 z-0"></div>

                        {[
                            { title: "Record", desc: "Press the mic button and ask your question.", icon: <Mic /> },
                            { title: "Analyze", desc: "Our AI processes your query instantly.", icon: <Activity /> },
                            { title: "Solve", desc: "Get actionable advice in your language.", icon: <CheckCircle /> }
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 text-center group">
                                <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border-4 border-earth-100">
                                    <div className="text-leaf-600 w-10 h-10 [&>svg]:w-full [&>svg]:h-full">
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 px-8">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto bg-leaf-900 rounded-[3rem] relative overflow-hidden px-8 py-20 md:px-20 text-center shadow-2xl">
                    {/* Background Textures */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-leaf-500 rounded-full blur-[120px] opacity-20"></div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                            Ready to modernize <br /> your harvest?
                        </h2>
                        <p className="text-leaf-100 text-lg max-w-2xl mx-auto">
                            Join the revolution of voice-first farming. No credit card required, just sign up and start speaking.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/sign-in" className="px-8 py-4 bg-white text-leaf-900 rounded-full font-bold hover:bg-leaf-50 transition-colors flex items-center gap-2">
                                Get Started Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            <div className="text-white/60 text-sm font-medium">
                                Free for up to 5 acres
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-earth-900 text-earth-200 pt-20 pb-10 rounded-t-[3rem] mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white">
                                <div className="bg-leaf-600 p-2 rounded-lg">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-serif font-bold">AgriVoice</span>
                            </div>
                            <p className="text-earth-400 leading-relaxed">
                                Empowering farmers with accessible, intelligent technology designed for the field, not the office.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-leaf-600 hover:text-white transition-colors cursor-pointer border border-white/10">
                                        <Users className="w-5 h-5" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Product</h4>
                            <ul className="space-y-4 text-sm">
                                {['Voice Assistant', 'Market Prices', 'Weather Shield', 'Community', 'Crop Doctor'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-leaf-400 transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Company</h4>
                            <ul className="space-y-4 text-sm">
                                {['About Us', 'Careers', 'Impact Reports', 'Partners', 'Contact'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-leaf-400 transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-earth-500">
                        <p>© 2026 AgriVoice Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};