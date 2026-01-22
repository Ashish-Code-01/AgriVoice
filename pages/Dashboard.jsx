
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGeminiLive } from "../hooks/useGeminiLive";
import { Visualizer } from "../components/Visualizer";
import { UserButton } from "@clerk/clerk-react";
import { SessionStatus } from "../types";

/**
 * Helpers
 */
function speak(text, lang = "hi-IN") {
  try {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch { }
}

function stopSpeak() {
  try {
    window.speechSynthesis.cancel();
  } catch { }
}

function formatTime(ts) {
  try {
    const d = new Date(ts || Date.now());
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
  >
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-2xl">
      {icon}
    </div>
    <div className="text-center text-xs font-semibold text-stone-700">
      {label}
    </div>
  </button>
);

const ChatBubble = ({ side = "left", children }) => {
  const isLeft = side === "left";
  return (
    <div className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className={[
          "max-w-[85%] rounded-3xl px-4 py-3 shadow-sm",
          isLeft
            ? "bg-white border border-stone-200 text-stone-800"
            : "bg-emerald-600 text-white",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};

const ChipButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
  >
    {children}
  </button>
);

const App = () => {
  const { status, transcriptions, connect, disconnect, volume, error } =
    useGeminiLive();

  const isConnected =
    status === SessionStatus.CONNECTED || status === SessionStatus.CONNECTING;

  const chatRef = useRef(null);
  const [audioMode, setAudioMode] = useState(true); // default ON (for old farmers)

  /**
   * Auto-scroll chat to bottom
   */
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [transcriptions?.length]);

  /**
   * Auto speak latest assistant response (Kisan-friendly)
   */
  const latestAssistantText = useMemo(() => {
    if (!transcriptions?.length) return "";
    // Assumption: your transcriptions include something like { role: "user"|"assistant", text, timestamp }
    // If your structure differs, tell me, I’ll map it exactly.
    const last = [...transcriptions].reverse().find((t) => t.role !== "user");
    return last?.text || "";
  }, [transcriptions]);

  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (!audioMode) return;
    if (!latestAssistantText) return;
    if (latestAssistantText === lastSpokenRef.current) return;

    lastSpokenRef.current = latestAssistantText;
    speak(latestAssistantText, "hi-IN"); // change to "mr-IN"/"gu-IN" etc if needed
  }, [latestAssistantText, audioMode]);

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
      stopSpeak();
    } else {
      connect();
    }
  };

  const handleEmergency = () => {
    // In a real build, you can push a "system prompt" / send event to start emergency triage.
    alert("🆘 Emergency Mode: Speak your issue (crop + symptom + days).");
    if (!isConnected) connect();
  };

  const quickQuestions = [
    { icon: "🍅", label: "Tomato problem" },
    { icon: "🐛", label: "Pest attack" },
    { icon: "💧", label: "Water issue" },
    { icon: "🌾", label: "Crop growth" },
    { icon: "☁️", label: "Weather risk" },
    { icon: "🧪", label: "Fertilizer" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-emerald-50 text-stone-800">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-green-100/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 shadow-sm text-white text-lg">
              🌿
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-stone-900">
                AgriVoice
              </h1>
              <p className="text-xs text-stone-500">
                Voice assistant for farmers
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Audio mode toggle */}
            <button
              onClick={() => setAudioMode((v) => !v)}
              className={[
                "hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold shadow-sm transition",
                audioMode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-600",
              ].join(" ")}
              title="Audio Mode"
            >
              {audioMode ? "🔊 Audio ON" : "🔇 Audio OFF"}
            </button>

            {/* Status */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
              </span>
              {isConnected ? "Listening" : "Ready"}
            </div>

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_320px]">
        {/* Chat Area */}
        <section className="rounded-3xl border border-stone-200 bg-white/80 shadow-lg backdrop-blur">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-stone-900">
                Voice Chat
              </p>
              <p className="text-xs text-stone-500">
                Tap mic and speak. AI will answer in simple steps.
              </p>
            </div>

            <button
              onClick={handleEmergency}
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-red-700"
            >
              🆘 Emergency
            </button>
          </div>

          {/* Error / Listening bar */}
          <div className="px-4 pt-4">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600"></span>
                </span>
                Listening... Speak now 🎙️
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm">
                ✅ Tap the mic to start
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="h-[26vh] sm:h-[30vh] overflow-y-auto px-4 py-5 space-y-3"
          >
            {/* Welcome message */}
            <ChatBubble side="left">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-50 text-lg">
                  🤖
                </div>
                <div>
                  <p className="text-sm font-bold">AgriVoice</p>
                  <p className="text-sm leading-relaxed text-stone-700">
                    Speak your farming problem. I will ask small questions and
                    give 3-step solution ✅
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ChipButton onClick={() => speak("आप किस फसल के बारे में पूछना चाहते हैं?", "hi-IN")}>
                      🔊 Play Hindi
                    </ChipButton>
                    <ChipButton onClick={() => setAudioMode(true)}>
                      🔊 Audio Mode
                    </ChipButton>
                  </div>
                </div>
              </div>
            </ChatBubble>

            {/* Dynamic transcriptions */}
            {transcriptions?.map((t, idx) => {
              const isUser = t.role === "user";
              return (
                <ChatBubble key={idx} side={isUser ? "right" : "left"}>
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "grid h-9 w-9 place-items-center rounded-2xl text-lg",
                        isUser ? "bg-white/15" : "bg-emerald-50",
                      ].join(" ")}
                    >
                      {isUser ? "👨‍🌾" : "🤖"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold">
                          {isUser ? "Farmer" : "AgriVoice"}
                        </p>
                        <span className="text-[11px] opacity-80">
                          {formatTime(t.timestamp)}
                        </span>
                      </div>

                      {/* text */}
                      <p className="mt-1 text-sm leading-relaxed">
                        {t.text || (isUser ? "🎤 Voice message" : "🔊 Reply")}
                      </p>

                      {/* actions for assistant */}
                      {!isUser && t.text && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => speak(t.text, "hi-IN")}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700"
                          >
                            🔁 Replay
                          </button>

                          <button
                            onClick={() =>
                              navigator.share?.({ text: t.text }).catch(() => {
                                navigator.clipboard?.writeText(t.text);
                                alert("✅ Copied. Now share on WhatsApp.");
                              })
                            }
                            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-extrabold text-stone-700"
                          >
                            📤 Share
                          </button>

                          <button
                            onClick={() => alert("✅ Tip: App can show 3-step actions here")}
                            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-extrabold text-stone-700"
                          >
                            ✅ 3 Steps
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </ChatBubble>
              );
            })}
          </div>

          {/* Bottom Voice Input (ChatGPT-style bar) */}
          <div className="border-t border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggle}
                className="rounded-full focus:outline-none focus:ring-4 focus:ring-emerald-200"
                aria-label={isConnected ? "Stop listening" : "Start listening"}
              >
                <Visualizer isActive={isConnected} volume={volume} />
              </button>

              <div className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-600 shadow-sm">
                {isConnected
                  ? "🎙️ बोलिए… (Speak now)"
                  : "Tap mic to ask farming question"}
              </div>

              {isConnected ? (
                <button
                  onClick={handleToggle}
                  className="rounded-2xl bg-stone-900 px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-stone-800"
                >
                  ⏹ Stop
                </button>
              ) : (
                <button
                  onClick={handleToggle}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700"
                >
                  🎤 Start
                </button>
              )}
            </div>

            <p className="mt-3 text-center text-[11px] text-stone-500">
              Note: Not substitute for professional inspection.
            </p>
          </div>
        </section>

        {/* Right Panel (Quick actions) */}
        <aside className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-extrabold text-stone-900">Quick Help</p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              Tap to start guided questions
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickQuestions.map((x) => (
                <QuickActionButton
                  key={x.label}
                  icon={x.icon}
                  label={x.label}
                  onClick={() => {
                    alert(`${x.label} ✅ Speak now`);
                    if (!isConnected) connect();
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-extrabold text-stone-900">Tips</p>

            <ul className="mt-3 space-y-2 text-xs font-semibold text-stone-600">
              <li>✅ Say crop + problem + days</li>
              <li>✅ Speak slowly, clear</li>
              <li>✅ Take phone near mouth</li>
              <li>✅ If possible upload photo (future)</li>
            </ul>
          </div>

          {/* Audio Mode Card */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-sm font-extrabold text-emerald-900">
              🔊 Audio Mode
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Best for farmers who cannot read
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setAudioMode(true)}
                className="flex-1 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white"
              >
                ON
              </button>
              <button
                onClick={() => setAudioMode(false)}
                className="flex-1 rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs font-extrabold text-emerald-700"
              >
                OFF
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-stone-400">
        <p>AgriVoice • Built for rural voice-first farming guidance</p>
      </footer>
    </div>
  );
};

export default App;
