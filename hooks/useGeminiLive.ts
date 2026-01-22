import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio';

type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;

interface UseGeminiLiveReturn {
  isConnected: boolean;
  isStreaming: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  volume: number; // 0 to 1
  error: string | null;
}

export const useGeminiLive = (): UseGeminiLiveReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio context and processing
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Refs for Gemini session
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Volume visualization loop
  const volumeIntervalRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    // Stop volume loop
    if (volumeIntervalRef.current) {
      window.clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    setVolume(0);

    // Close session (LiveSession doesn't have an explicit close method in the alpha SDK usually, 
    // but we stop sending data and close contexts). 
    // The instructions say use session.close() if available or just drop it.
    // We will clean up the audio side effectively ending the interaction.
    // Note: The provided SDK types in instruction imply session.close() exists.
    sessionPromiseRef.current?.then(s => {
      // @ts-ignore - Close might not be strictly typed in all versions but good practice
      if (typeof s.close === 'function') s.close();
    }).catch(() => { });
    sessionPromiseRef.current = null;

    // Stop Microhpone
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    // Disconnect Nodes
    sourceNodeRef.current?.disconnect();
    scriptProcessorRef.current?.disconnect();
    analyserRef.current?.disconnect();

    // Close Contexts
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;

    // Stop playing audio
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { }
    });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setIsConnected(false);
    setIsStreaming(false);
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);

      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });

      // Resume if suspended (browser policy)
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // 2. Setup Input Stream (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Analyser for visualization
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start volume monitoring
      volumeIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(avg / 255); // Normalize to 0-1
      }, 50);

      // 3. Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setIsConnected(true);
            setIsStreaming(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => audioSourcesRef.current.delete(source);

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              console.log('Model interrupted by user');
              audioSourcesRef.current.forEach(src => {
                try { src.stop(); } catch (e) { }
              });
              audioSourcesRef.current.clear();
              if (outputAudioContextRef.current) {
                nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
              }
            }
          },
          onclose: () => {
            console.log('Gemini Live Connection Closed');
            cleanup();
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setError("Connection error occurred.");
            cleanup();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

      // 4. Setup Audio Processing (Input to Gemini)
      // Buffer size 4096 is a balance between latency and performance for ScriptProcessor
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);

        sessionPromiseRef.current?.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => console.error("Failed to send audio", err));
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination); // Required for script processor to run

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to initialize voice session.");
      cleanup();
    }
  }, [cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    isConnected,
    isStreaming,
    connect,
    disconnect,
    volume,
    error
  };
};