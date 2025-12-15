'use client';

import { useState, useMemo, useEffect } from 'react';
import ImageMapper from 'react-img-mapper';
import { Toaster } from '@/components/ui/sonner';
import { useCrocodileGame } from '@/hooks/use-crocodile-game';
import { GameInfo } from '@/components/game-info';

export default function TeethMapPage() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    removedTeeth,
    gameLost,
    showCrapOverlay,
    isProcessing,
    teethPositions,
    handleToothClick,
    handleRetry,
  } = useCrocodileGame();

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);



  const visibleTeeth = teethPositions.filter(tooth => !removedTeeth.has(tooth.id));

  // Generate stable bubble configurations to avoid hydration mismatch
  const bubbleConfigs = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      width: Math.random() * 30 + 10,
      height: Math.random() * 30 + 10,
      left: Math.random() * 100,
      animationDuration: Math.random() * 8 + 5,
      animationDelay: Math.random() * 10,
      translateX: Math.random() * 100 - 50,
    }));
  }, []);

  // Generate flying teeth on background
  const backgroundTeethConfigs = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      left: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
      animationDuration: Math.random() * 10 + 8,
      animationDelay: Math.random() * 12,
      translateX: Math.random() * 100 - 50,
      rotation: Math.random() * 360,
    }));
  }, []);


  const toothShape = [
    30.5, 24,
    0.5, 102.5,
    0.5, 122,
    30.5, 143.5,
    94.5, 143.5,
    120, 122,
    120, 102.5,
    94.5, 24,
    81, 0.5,
    47.5, 0.5,
  ];

  // Helper function to create tooth polygon with offset
  const createTooth = (offsetX: number, offsetY: number) => {
    return toothShape.map((coord, index) =>
      index % 2 === 0 ? coord + offsetX : coord + offsetY
    );
  };

  const MAP = {
    name: 'Group 1',
    areas: gameLost ? [] : visibleTeeth.map((tooth) => ({
      id: tooth.id,
      title: 'tooth1',
      shape: 'poly' as const,
      coords: createTooth(tooth.x, tooth.y),
    })),
  };

  const handleAreaClick = async (area: any) => {
    await handleToothClick(area.id);
  };

  const imageWidth = 1080;
  const imageHeight = 1920;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-700 to-teal-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto relative">

        {isMounted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {bubbleConfigs.map((bubble, i) => (
              <div
                key={i}
                className="bubble absolute rounded-full bg-white opacity-20"
                style={{
                  width: `${bubble.width}px`,
                  height: `${bubble.height}px`,
                  left: `${bubble.left}%`,
                  bottom: '0',
                  // @ts-ignore
                  '--bubble-duration': `${bubble.animationDuration}s`,
                  '--bubble-delay': `${bubble.animationDelay}s`,
                  '--bubble-x': `${bubble.translateX}px`,
                }}
              />
            ))}
          </div>
        )}

        {isMounted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {backgroundTeethConfigs.map((tooth, i) => (
              <img
                key={`bg-tooth-${i}`}
                src="/tooth.png"
                alt="flying tooth"
                className="flying-tooth-bg absolute"
                style={{
                  left: `${tooth.left}%`,
                  bottom: '0',
                  width: `${tooth.scale * 100}px`,
                  height: 'auto',
                  opacity: 0.4,
                  // @ts-ignore
                  '--bubble-duration': `${tooth.animationDuration}s`,
                  '--bubble-delay': `${tooth.animationDelay}s`,
                  '--bubble-x': `${tooth.translateX}px`,
                  '--bubble-rotation': `${tooth.rotation}deg`,
                }}
              />
            ))}
          </div>
        )}

        <div className="w-full relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            🐊 Croc.fi 🐊
          </h1>
          <p className="text-sm text-blue-200 mb-1 text-center">
            Choose who will pay for your dinner with fully onchain VRF by MagicBlock
          </p>
          <div className="flex justify-center">
            <div className="relative inline-block">
              <ImageMapper
                src={gameLost ? "/close.png" : "/croc.jpg"}
                name={MAP.name}
                areas={MAP.areas}
                onClick={handleAreaClick}
                responsive
                parentWidth={500}
                strokeColor="white"
                // fillColor="rgba(59, 130, 246, 0.1)"
                lineWidth={0}
                canvasProps={{
                  style: { position: 'relative', zIndex: 1 }
                }}
              />

              {/* Overlay tooth images */}
              {gameLost ? null : [...visibleTeeth].reverse().map((tooth) => (
                <img
                  key={tooth.id}
                  src="/tooth.png"
                  alt="tooth"
                  className="absolute pointer-events-none"
                  style={{
                    left: `${(tooth.x / imageWidth) * 100}%`,
                    top: `${(tooth.y / imageHeight) * 100}%`,
                    width: `${(121 / imageWidth) * 100}%`,
                    height: 'auto',
                    zIndex: 10,
                  }}
                />
              ))}

            </div>
          </div>
        </div>

        {/* CRAP overlay when game is lost - full screen */}
        {showCrapOverlay && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative opacity-90">
              {/* Comic-style burst background */}
              <div className="absolute inset-0 transform scale-150 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-full h-full" style={{ width: '700px', height: '700px' }}>
                  <path
                    d="M 150,20 L 165,80 L 220,60 L 185,110 L 240,140 L 180,155 L 200,210 L 155,175 L 140,230 L 125,175 L 80,210 L 100,155 L 40,140 L 95,110 L 60,60 L 115,80 Z"
                    fill="#FF4444"
                    stroke="#000"
                    strokeWidth="6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* CRAP text */}
              <div className="relative text-center px-16 py-8">
                <div
                  style={{
                    fontSize: '180px',
                    fontWeight: '900',
                    color: '#87CEEB',
                    textShadow: `
                    -8px -8px 0 #000,
                    8px -8px 0 #000,
                    -8px 8px 0 #000,
                    8px 8px 0 #000,
                    -8px 0 0 #000,
                    8px 0 0 #000,
                    0 -8px 0 #000,
                    0 8px 0 #000,
                    0 0 30px rgba(255,255,255,0.8)
                  `,
                    transform: 'rotate(-5deg)',
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    letterSpacing: '0.15em',
                    lineHeight: '1'
                  }}
                >
                  CRAP
                </div>
                {/* Retry button */}
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleRetry}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-lg shadow-lg transform transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                      fontFamily: 'Impact, Arial Black, sans-serif',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {isProcessing ? 'STARTING...' : 'RETRY'}
                  </button>
                </div>
              </div>
            </div>

          </div>

        )}
        <GameInfo />
        </div>
      </div>
    </>
  );
}
