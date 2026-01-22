import React from 'react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Visualizer } from '../components/Visualizer';
import { UserButton } from "@clerk/clerk-react";

const App = () => {
  const { isConnected, connect, disconnect, volume, error } = useGeminiLive();

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-emerald-50 text-stone-800">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-green-100/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-stone-900">AgriVoice</h1>
              <p className="text-xs text-stone-500">AI voice assistant for farmers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
              </span>
              Online
            </div>

            {/* Profile / logout */}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr]">
        {/* Left hero */}
        <section className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ✅ Voice-first farming guidance
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Ask farming questions in your voice.
            <span className="block text-green-700">Get instant help.</span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Tap the mic, speak naturally, and AgriVoice will listen and respond with simple,
            practical recommendations.
          </p>

          {/* Error / Listening */}
          <div className="mt-6 min-h-[56px]">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600"></span>
                </span>
                Listening... speak now
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
                Tap the microphone to start a session.
              </div>
            )}
          </div>

          {/* Quick questions chips */}
          {!isConnected && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-stone-500">Quick questions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "Tomato leaves turning yellow?",
                  "How to save water for rice?",
                  "Best fertilizer for corn?",
                  "How to prevent pest attack?",
                ].map((q) => (
                  <button
                    key={q}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => alert(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right mic card */}
        <section className="relative">
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-900">Voice Session</p>
              <span className="text-xs text-stone-500">
                {isConnected ? "Tap to stop" : "Tap to start"}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <button
                onClick={handleToggle}
                className="rounded-full focus:outline-none focus:ring-4 focus:ring-emerald-200"
                aria-label={isConnected ? "Stop listening" : "Start listening"}
              >
                <Visualizer isActive={isConnected} volume={volume} />
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-stone-100 bg-gradient-to-b from-stone-50 to-white px-4 py-4 text-xs text-stone-500">
              <p className="font-semibold text-stone-700">Tips</p>
              <ul className="mt-2 space-y-1">
                <li>• Speak clearly and keep phone close.</li>
                <li>• Mention crop + symptoms + duration.</li>
                <li>• Example: “Cotton leaves curling 3 days”.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-stone-400">
        <p>Expert farming advice powered by AI.</p>
        <p>Not a substitute for professional inspection.</p>
      </footer>
    </div>
  );
};

export default App;
