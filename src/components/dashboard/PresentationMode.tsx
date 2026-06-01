import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, X, ChevronLeft, ChevronRight,
  Maximize2, Monitor, Clock, SkipForward
} from 'lucide-react';

interface PresentationSlide {
  id: string;
  label: string;
  icon: string;
}

interface PresentationModeProps {
  isActive: boolean;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
  currentTab: string;
  children: React.ReactNode;
}

const SLIDES: PresentationSlide[] = [
  { id: 'executivo', label: 'Visão Executiva', icon: '📊' },
  { id: 'planejamento', label: 'Planejamento Estratégico', icon: '🎯' },
  { id: 'indicadores', label: 'Análise Avançada', icon: '📈' },
];

const INTERVAL_OPTIONS = [10, 15, 20, 30, 45, 60];

export function PresentationMode({
  isActive,
  onClose,
  onTabChange,
  currentTab,
  children,
}: PresentationModeProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSec, setIntervalSec] = useState(15);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const currentIndex = SLIDES.findIndex((s) => s.id === currentTab);
  const currentSlide = SLIDES[currentIndex] || SLIDES[0];

  // Fullscreen
  useEffect(() => {
    if (isActive) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [isActive]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const handleMove = () => resetControlsTimer();
    window.addEventListener('mousemove', handleMove);
    resetControlsTimer();
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isActive, resetControlsTimer]);

  // Navigation
  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % SLIDES.length;
    onTabChange(SLIDES[next].id);
    progressRef.current = 0;
    setProgress(0);
    lastTickRef.current = performance.now();
  }, [currentIndex, onTabChange]);

  const goPrev = useCallback(() => {
    const prev = (currentIndex - 1 + SLIDES.length) % SLIDES.length;
    onTabChange(SLIDES[prev].id);
    progressRef.current = 0;
    setProgress(0);
    lastTickRef.current = performance.now();
  }, [currentIndex, onTabChange]);

  // Smooth progress animation
  useEffect(() => {
    if (!isActive || !isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    lastTickRef.current = performance.now();
    progressRef.current = 0;

    const tick = (now: number) => {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += (delta / (intervalSec * 1000)) * 100;

      if (progressRef.current >= 100) {
        goNext();
        return;
      }

      setProgress(progressRef.current);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, isPlaying, intervalSec, currentTab, goNext]);

  // Keyboard controls
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'p':
          setIsPlaying((p) => !p);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, goNext, goPrev, onClose]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#081C2E] flex flex-col overflow-hidden"
    >
      {/* Top progress bar */}
      <div className="h-1 w-full bg-black/30 relative z-50 flex-shrink-0">
        <div className="absolute inset-0 flex">
          {SLIDES.map((slide, i) => (
            <div key={slide.id} className="flex-1 relative">
              {i > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />}
              <div
                className="h-full transition-all duration-100 ease-linear"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                  background: i < currentIndex
                    ? 'linear-gradient(90deg, #C62828, #F4A300)'
                    : i === currentIndex
                    ? 'linear-gradient(90deg, #C62828, #F4A300)'
                    : 'transparent',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Inject presentation styling */}
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </div>

      {/* Bottom controls - auto-hide */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#0D2137]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-5 shadow-2xl shadow-black/40">
              
              {/* Slide info */}
              <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                <span className="text-lg">{currentSlide.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Slide {currentIndex + 1}/{SLIDES.length}
                  </span>
                  <span className="text-xs font-bold text-[#F5F7FA] leading-tight">
                    {currentSlide.label}
                  </span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Anterior (←)"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className={`p-2.5 rounded-xl transition font-bold ${
                    isPlaying
                      ? 'bg-[#C62828]/20 text-[#C62828] hover:bg-[#C62828]/30 border border-[#C62828]/30'
                      : 'bg-[#008F72]/20 text-[#008F72] hover:bg-[#008F72]/30 border border-[#008F72]/30'
                  }`}
                  title={isPlaying ? 'Pausar (P)' : 'Reproduzir (P)'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={goNext}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Próximo (→)"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Timer picker */}
              <div className="relative pl-4 border-l border-white/10">
                <button
                  onClick={() => setShowTimerPicker((p) => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-xs font-bold"
                  title="Tempo por slide"
                >
                  <Clock size={14} />
                  {intervalSec}s
                </button>

                <AnimatePresence>
                  {showTimerPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#132F4C] border border-white/10 rounded-xl p-2 flex gap-1 shadow-xl"
                    >
                      {INTERVAL_OPTIONS.map((sec) => (
                        <button
                          key={sec}
                          onClick={() => {
                            setIntervalSec(sec);
                            setShowTimerPicker(false);
                            progressRef.current = 0;
                            setProgress(0);
                            lastTickRef.current = performance.now();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            intervalSec === sec
                              ? 'bg-[#F4A300] text-[#081C2E]'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Exit */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#C62828]/20 text-slate-400 hover:text-[#C62828] transition ml-2"
                title="Sair (ESC)"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide indicator dots */}
      <div className="absolute top-4 right-6 z-50 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => {
              onTabChange(slide.id);
              progressRef.current = 0;
              setProgress(0);
              lastTickRef.current = performance.now();
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 bg-[#F4A300]'
                : i < currentIndex
                ? 'w-2 bg-[#C62828]'
                : 'w-2 bg-white/20'
            }`}
            title={slide.label}
          />
        ))}
      </div>

      {/* Keyboard hint - shows briefly */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-6 z-50 flex items-center gap-3 text-[10px] text-slate-500"
          >
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">ESC</kbd>
              Sair
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">← →</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">P</kbd>
              Play/Pause
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Button to trigger presentation mode from the header
export function PresentationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-[#C62828]/10 border border-[#C62828]/30 px-4 py-2 text-xs font-bold text-[#C62828] hover:bg-[#C62828]/20 hover:text-white transition-all duration-300 group"
      title="Modo Apresentação"
    >
      <Monitor size={14} className="group-hover:scale-110 transition-transform" />
      <span className="hidden lg:inline">Apresentação</span>
    </button>
  );
}
