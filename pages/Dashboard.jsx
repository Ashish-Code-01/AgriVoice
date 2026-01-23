import React, { useEffect, useMemo, useRef, useState } from "react";
import { SYSTEM_INSTRUCTION } from "@/constants";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { UserButton } from "@clerk/clerk-react";


const SessionStatus = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected"
};

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
    className="flex flex-col items-center justify-center gap-2.5 rounded-lg bg-gradient-to-br from-white to-stone-50 px-4 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:from-emerald-50 hover:to-emerald-100 border border-stone-100 hover:border-emerald-300 active:scale-95"
  >
    <div className="text-3xl">{icon}</div>
    <div className="text-center text-[11px] font-semibold text-stone-700 leading-tight">
      {label}
    </div>
  </button>
);

const ChatBubble = ({ side = "left", children }) => {
  const isLeft = side === "left";
  return (
    <div className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed transition-all ${isLeft
          ? "bg-stone-100 text-stone-900 shadow-none"
          : "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
          }`}
      >
        {children}
      </div>
    </div>
  );
};

const ChipButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-none transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
  >
    {children}
  </button>
);

const Visualizer = ({ isActive, volume }) => {
  return (
    <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${isActive ? "bg-emerald-600 shadow-lg shadow-emerald-500/40 scale-110" : "bg-emerald-600 shadow-md"
      }`}>
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-40" />
        </>
      )}
      <span className="relative text-2xl">🎤</span>
    </div>
  );
};

const App = () => {
  const { status, transcriptions, connect, disconnect, volume, error } = useGeminiLive();

  const isConnected = status === SessionStatus.CONNECTED || status === SessionStatus.CONNECTING;

  const chatRef = useRef(null);
  const [audioMode, setAudioMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [frameFile, setFrameFile] = useState(null);
  const [aiResult, setAiResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Auto-scroll chat to bottom
   */
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [transcriptions?.length, aiResult]);

  /**
   * Auto speak latest assistant response
   */
  const latestAssistantText = useMemo(() => {
    if (!transcriptions?.length) return "";
    const last = [...transcriptions].reverse().find((t) => t.role !== "user");
    return last?.text || "";
  }, [transcriptions]);

  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (!audioMode) return;
    if (!latestAssistantText) return;
    if (latestAssistantText === lastSpokenRef.current) return;

    lastSpokenRef.current = latestAssistantText;
    speak(latestAssistantText, "hi-IN");
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

  const extractFrame = (videoFile, timeInSeconds = 3) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(timeInSeconds, video.duration);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            resolve(new File([blob], "frame.jpg", { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9
        );
      };

      video.onerror = () => reject(new Error("Video processing failed"));
    });
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setSelectedFile(null);
    setAiResult("");
    setUploadStatus("Extracting frame from video...");

    try {
      const frame = await extractFrame(file, 3);
      setFrameFile(frame);
      setUploadStatus("✅ Frame extracted - ready to analyze");
    } catch (err) {
      setUploadStatus("❌ Failed to extract frame from video");
      setFrameFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setSelectedFile(file);
    setVideoFile(null);
    setFrameFile(null);
    setAiResult("");
    setUploadStatus("");
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async () => {
    const fileToAnalyze = frameFile || selectedFile;
    if (!fileToAnalyze) return;

    setIsAnalyzing(true);
    setUploadStatus("🔍 Analyzing with AI...");
    setAiResult("");

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key missing - set VITE_GEMINI_API_KEY in .env");

      const base64Data = await fileToBase64(fileToAnalyze);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: SYSTEM_INSTRUCTION,
                  },
                  {
                    inline_data: {
                      mime_type: fileToAnalyze.type,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Gemini API error");
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

      setAiResult(text);
      setUploadStatus("✅ Analysis complete!");

      if (audioMode) {
        speak(text, "hi-IN");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Error: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setVideoFile(null);
    setFrameFile(null);
    setAiResult("");
    setUploadStatus("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen w-full bg-stone-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-md text-white text-lg font-bold">
              A
            </div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-base font-bold text-stone-900">AgriVoice</h1>
              <p className="text-xs text-stone-500">AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setAudioMode((v) => !v)}
              className={`hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${audioMode
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                }`}
            >
              {audioMode ? "🔊" : "🔇"}
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Chat Area */}
          <section className="flex flex-col rounded-xl border border-stone-200 bg-white shadow-md overflow-hidden">
            {/* Chat header */}
            <div className="border-b border-stone-200 bg-stone-50 px-4 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Voice Chat & Analysis</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Speak or upload media for AI guidance
                  </p>
                </div>

                <button
                  onClick={handleEmergency}
                  className="flex-shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700 transition-all active:scale-95 whitespace-nowrap"
                >
                  🆘 Emergency
                </button>
              </div>
            </div>

            {/* Status bar */}
            <div className="px-4 py-3 md:px-6">
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  ⚠️ {error}
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></span>
                  </span>
                  Listening...
                </div>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-600">
                  ✓ Ready to assist
                </div>
              )}
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-3 min-h-[400px] max-h-[550px]"
            >
              {/* Welcome message */}
              <ChatBubble side="left">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-base flex-shrink-0">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900">AgriVoice</p>
                    <p className="text-xs leading-relaxed text-stone-800 mt-1">
                      Speak about your farming issue or upload photos/videos for AI analysis. Get step-by-step solutions instantly! 🌱
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <ChipButton onClick={() => speak("आप किस फसल के बारे में पूछना चाहते हैं?", "hi-IN")}>
                        🔊 Hindi
                      </ChipButton>
                    </div>
                  </div>
                </div>
              </ChatBubble>

              {/* Transcriptions */}
              {transcriptions?.map((t, idx) => {
                const isUser = t.role === "user";
                return (
                  <ChatBubble key={idx} side={isUser ? "right" : "left"}>
                    <div className="flex items-start gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-base flex-shrink-0 ${isUser ? "bg-emerald-200" : "bg-emerald-100"
                          }`}
                      >
                        {isUser ? "👨‍🌾" : "🤖"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-stone-900">
                            {isUser ? "You" : "AgriVoice"}
                          </p>
                          <span className="text-[10px] opacity-60">
                            {formatTime(t.timestamp)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-relaxed">
                          {t.text || (isUser ? "🎤 Voice message" : "🔊 Reply")}
                        </p>

                        {!isUser && t.text && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <button
                              onClick={() => speak(t.text, "hi-IN")}
                              className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                            >
                              🔁 Replay
                            </button>
                            <button
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({ text: t.text }).catch(() => { });
                                } else if (navigator.clipboard) {
                                  navigator.clipboard.writeText(t.text);
                                  alert("✅ Copied!");
                                }
                              }}
                              className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-all hover:bg-stone-100 active:scale-95"
                            >
                              📤 Share
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ChatBubble>
                );
              })}

              {/* Image Analysis Result */}
              {aiResult && (
                <ChatBubble side="left">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-base flex-shrink-0">
                      🤖
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900">Analysis Result</p>
                      <div className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-stone-800">
                        {aiResult}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button
                          onClick={() => speak(aiResult, "hi-IN")}
                          className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                        >
                          🔁 Read
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(aiResult);
                              alert("✅ Copied!");
                            }
                          }}
                          className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-all hover:bg-stone-100 active:scale-95"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </ChatBubble>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-stone-200 bg-white p-4 md:p-6 space-y-4">
              {uploadStatus && (
                <div className={`rounded-lg px-4 py-2 text-xs font-medium text-center ${uploadStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                  uploadStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleToggle}
                  disabled={isAnalyzing}
                  className="rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-95 disabled:opacity-50"
                  aria-label={isConnected ? "Stop listening" : "Start listening"}
                >
                  <Visualizer isActive={isConnected} volume={volume} />
                </button>

                <div className="hidden sm:block flex-1 rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-xs font-medium text-stone-600 text-center">
                  {isConnected
                    ? "🎤 Listening..."
                    : "Tap mic or upload media"}
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer flex-1 sm:flex-none">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      disabled={isAnalyzing}
                    />
                    <div className="rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white text-xs shadow-sm hover:bg-blue-700 transition-all active:scale-95 text-center">
                      📸
                    </div>
                  </label>

                  <label className="cursor-pointer flex-1 sm:flex-none">
                    <input
                      type="file"
                      accept="video/*"
                      ref={videoInputRef}
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                    <div className="rounded-lg bg-purple-600 px-3 py-2.5 font-medium text-white text-xs shadow-sm hover:bg-purple-700 transition-all active:scale-95 text-center">
                      📹
                    </div>
                  </label>

                  {(selectedFile || frameFile) && (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isAnalyzing ? "⏳" : "🔍"}
                    </button>
                  )}

                  {(selectedFile || frameFile) && !isAnalyzing && (
                    <button
                      onClick={handleClear}
                      className="rounded-lg bg-stone-200 px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 transition-all active:scale-95"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-[10px] text-stone-500">
                🔒 Secure • AI-powered guidance
              </p>
            </div>
          </section>

          {/* Right Panel */}
          <aside className="space-y-5 hidden lg:block">
            {/* Quick Actions */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-md">
              <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Quick Help</p>
              <p className="mt-1 text-xs text-stone-500">
                Common issues
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
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
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-md">
              <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Tips</p>

              <ul className="mt-3 space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                  <span>Describe crop, problem, and duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                  <span>Speak clearly in quiet areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                  <span>Upload clear, well-lit photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                  <span>Videos extract frames at every 2s</span>
                </li>
              </ul>
            </div>

            {/* Audio Mode Card */}
            <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 shadow-md">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Audio</p>
              <p className="mt-1 text-xs text-emerald-700">
                Auto read responses
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setAudioMode(true)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${audioMode
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                    }`}
                >
                  ON
                </button>
                <button
                  onClick={() => setAudioMode(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${!audioMode
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                    }`}
                >
                  OFF
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 py-6 md:px-6 text-center text-xs text-stone-500">
        <p>AgriVoice • AI-powered farming guidance</p>
      </footer>
    </div>
  );
};

export default App;