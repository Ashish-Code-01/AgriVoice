import React, { useEffect, useMemo, useRef, useState } from "react";
import { SYSTEM_INSTRUCTION } from "@/constants";

/**
 * Mock hook for demonstration - replace with your actual useGeminiLive hook
 */
const useGeminiLive = () => {
  const [status, setStatus] = useState("disconnected");
  const [transcriptions, setTranscriptions] = useState([]);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");

  const connect = () => {
    setStatus("connected");
    setError("");
    setTimeout(() => {
      setTranscriptions([
        {
          role: "assistant",
          text: "Hello! I'm ready to help with your farming questions. Please describe your crop issue.",
          timestamp: Date.now()
        }
      ]);
    }, 500);
  };

  const disconnect = () => {
    setStatus("disconnected");
    setVolume(0);
  };

  return { status, transcriptions, connect, disconnect, volume, error };
};

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
    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-3 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md active:scale-95"
  >
    <div className="text-2xl">{icon}</div>
    <div className="text-center text-xs font-semibold text-stone-700 leading-tight">
      {label}
    </div>
  </button>
);

const ChatBubble = ({ side = "left", children }) => {
  const isLeft = side === "left";
  return (
    <div className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isLeft
            ? "bg-white border border-stone-200 text-stone-800"
            : "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
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
    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
  >
    {children}
  </button>
);

const Visualizer = ({ isActive, volume }) => {
  return (
    <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all ${isActive ? "bg-emerald-600 shadow-lg shadow-emerald-300/50 scale-110" : "bg-emerald-600"
      }`}>
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-50" />
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
  const [preview, setPreview] = useState(null);
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
      setPreview(URL.createObjectURL(frame));
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

  useEffect(() => {
    if (!selectedFile) {
      if (!frameFile) setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, frameFile]);

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
      const apiKey = 'AIzaSyB4BUhCRKju-GaffEP-sLZ8h9xxoow3w10';
      if (!apiKey) throw new Error("Gemini API key missing");

      const base64Data = await fileToBase64(fileToAnalyze);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
    setPreview(null);
    setAiResult("");
    setUploadStatus("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg text-white text-xl">
              🌿
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-stone-900">AgriVoice</h1>
              <p className="text-xs text-stone-500">AI Farming Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioMode((v) => !v)}
              className={`hidden sm:flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-all ${audioMode
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-emerald-200"
                  : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                }`}
            >
              {audioMode ? "🔊 Audio ON" : "🔇 Audio OFF"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Chat Area */}
          <section className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 px-6 py-4">
              <div>
                <p className="text-base font-bold text-stone-900">Voice Chat & Image Analysis</p>
                <p className="text-xs text-stone-600 mt-1">
                  Tap mic to speak or upload image/video for AI analysis
                </p>
              </div>

              <button
                onClick={handleEmergency}
                className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-xs font-bold text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all active:scale-95"
              >
                🆘 Emergency
              </button>
            </div>

            {/* Status bar */}
            <div className="px-6 pt-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  ⚠️ {error}
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-sm font-semibold text-green-700">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600"></span>
                  </span>
                  Listening... Speak now 🎙️
                </div>
              ) : (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
                  ✅ Ready - Tap mic to start or upload media
                </div>
              )}
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[400px] max-h-[500px]"
            >
              {/* Welcome message */}
              <ChatBubble side="left">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-lg flex-shrink-0">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">AgriVoice Assistant</p>
                    <p className="text-sm leading-relaxed text-stone-700 mt-1">
                      Welcome! I can help you in two ways: Speak your farming problem for voice guidance, or upload an image/video of your crops for AI analysis. I'll provide step-by-step solutions! ✅
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ChipButton onClick={() => speak("आप किस फसल के बारे में पूछना चाहते हैं?", "hi-IN")}>
                        🔊 Play Hindi
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
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg flex-shrink-0 ${isUser ? "bg-white/20" : "bg-gradient-to-br from-emerald-100 to-emerald-200"
                          }`}
                      >
                        {isUser ? "👨‍🌾" : "🤖"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">
                            {isUser ? "Farmer" : "AgriVoice"}
                          </p>
                          <span className="text-[10px] opacity-70">
                            {formatTime(t.timestamp)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-relaxed">
                          {t.text || (isUser ? "🎤 Voice message" : "🔊 Reply")}
                        </p>

                        {!isUser && t.text && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => speak(t.text, "hi-IN")}
                              className="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
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
                              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition-all hover:bg-stone-100 active:scale-95"
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
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-lg flex-shrink-0">
                      🤖
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">AI Analysis Result</p>
                      <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiResult}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => speak(aiResult, "hi-IN")}
                          className="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                        >
                          🔁 Read Aloud
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(aiResult);
                              alert("✅ Copied!");
                            }
                          }}
                          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition-all hover:bg-stone-100 active:scale-95"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </ChatBubble>
              )}

              {/* Preview uploaded media */}
              {preview && (
                <div className="flex justify-center">
                  <div className="rounded-xl border-2 border-emerald-200 overflow-hidden shadow-lg max-w-sm">
                    <img src={preview} alt="Preview" className="w-full h-auto" />
                    <div className="bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-semibold text-center">
                      {videoFile ? "📹 Frame from video" : "📸 Uploaded image"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-stone-200 bg-gradient-to-r from-stone-50 to-gray-50 p-5">
              {uploadStatus && (
                <div className={`mb-3 rounded-lg px-4 py-2 text-sm font-semibold text-center ${uploadStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                    uploadStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggle}
                  disabled={isAnalyzing}
                  className="rounded-full focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                  aria-label={isConnected ? "Stop listening" : "Start listening"}
                >
                  <Visualizer isActive={isConnected} volume={volume} />
                </button>

                <div className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-600">
                  {isConnected
                    ? "🎙️ बोलिए… (Speak now)"
                    : "Tap mic to ask or upload image/video"}
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      disabled={isAnalyzing}
                    />
                    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white text-xs shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95">
                      📸 Image
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      ref={videoInputRef}
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                    <div className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 font-semibold text-white text-xs shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all active:scale-95">
                      📹 Video
                    </div>
                  </label>
                </div>

                {(selectedFile || frameFile) && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isAnalyzing ? "⏳ Analyzing..." : "🔍 Analyze"}
                  </button>
                )}

                {(selectedFile || frameFile || preview) && !isAnalyzing && (
                  <button
                    onClick={handleClear}
                    className="rounded-xl bg-stone-200 px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-300 transition-all active:scale-95"
                  >
                    ✕
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-[10px] text-stone-500">
                🔒 Secure • Not a substitute for professional inspection
              </p>
            </div>
          </section>

          {/* Right Panel */}
          <aside className="space-y-5">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
              <p className="text-sm font-bold text-stone-900">⚡ Quick Help</p>
              <p className="mt-1 text-xs text-stone-600">
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
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
              <p className="text-sm font-bold text-stone-900">💡 Usage Tips</p>

              <ul className="mt-3 space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Say crop + problem + days affected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Speak slowly and clearly in a quiet place</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Upload clear photos in good lighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Videos auto-extract frames at 3 seconds</span>
                </li>
              </ul>
            </div>

            {/* Audio Mode Card */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 p-5 shadow-lg">
              <p className="text-sm font-bold text-emerald-900">🔊 Audio Mode</p>
              <p className="mt-1 text-xs text-emerald-700">
                AI reads responses aloud - perfect for all farmers
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setAudioMode(true)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${audioMode
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
                      : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                    }`}
                >
                  ON
                </button>
                <button
                  onClick={() => setAudioMode(false)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${!audioMode
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md"
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
      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-stone-500">
        <p>AgriVoice • Built for rural voice-first farming guidance • Powered by AI</p>
      </footer>
    </div>
  );
};

export default App;