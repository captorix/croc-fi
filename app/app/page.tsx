'use client';

import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { MagicBlockTextIcon, DrakesIcon } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="w-full max-w-[1400px] mx-auto relative min-h-screen flex flex-col items-center pt-[15vh]">
          {/* Decorative dotted pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #22c55e 2px, transparent 2px)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-green-500/50 bg-green-500/10">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
              </div>
              <span className="text-sm font-bold tracking-wider text-green-500">BACKED BY DRAKES</span>
            </div>
          </div> */}

          <div className="w-full mx-auto text-center  *:space-y-8 z-10">
          
            <h1 className="text-5xl md:text-4xl  font-bold tracking-tight leading-tight"> 
              <span className="text-green-500" style={{ 
                textShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}>
                Fully onchain Crocodile Dentist
                <br />
                with VRF by <span className="text-black"> <MagicBlockTextIcon className="w-70 h-20 inline-block pb-2 " /></span>
              </span>

            </h1>

            <div className="flex flex-row gap-12 items-center justify-center mt-15 w-full">
              <div className="max-w-md w-full">
                <img
                  src="/croc/narrow.png"
                  alt="Crocodile"
                  className="w-full h-auto animate-float"
                />
              </div>

              <div className="flex flex-col gap-6">

                <Button
                  onClick={() => router.push('/game')}
                  size="lg"
                  className="text-black px-16 py-12 text-xl font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(90deg, #fcf2d8, #22c55e, #84cc16 50%, #84cc16, #fcf2d8)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em'
                  }}
                >
                  Quick Play
                </Button>
                <Button
                  onClick={() => router.push('/create')}
                  size="lg"
                  className="text-black px-16 py-12 text-xl font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(90deg, #a0f, #f2805a 25%, #fcf2d8 50%, #59e09d 75%, #2c66e4)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em'
                  }}
                >
                  Wager GAME
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-2" style={{
                  fontFamily: 'monospace'
                }}>
                  Wager Game to play with escrow.
                </p>
              </div>
            </div>

            <p className="text-2xl text-black-10 font-bold">
              BACKED BY LUCID DRAKES <DrakesIcon className="w-8 h-8 inline-block" />
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
