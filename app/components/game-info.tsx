import Image from 'next/image';

export function GameInfo() {
  return (
    <>
      {/* Game title section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"></div>

        <div className="relative">
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 mb-4 border border-white/20 shadow-2xl shadow-cyan-500/10">
            <div className="flex justify-center">
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-200 via-blue-200 to-blue-300 bg-clip-text text-transparent leading-relaxed">
                croc.fi - private Crocodile Dentist game with tokens collateral
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Voshy section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"></div>

        <div className="relative">
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 mb-4 border border-white/20 shadow-2xl shadow-cyan-500/10">
            <div className="flex justify-center mb-6">
              <Image
                src="/voshy.jpg"
                alt="Voshy"
                width={150}
                height={150}
                className="rounded-full border-4 border-cyan-400 shadow-xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-200 via-blue-200 to-blue-300 bg-clip-text text-transparent leading-relaxed">
              voshy.fi - beat the croc and voshy will pay for your dinner
            </h2>

            <div className="space-y-6 text-white/90">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
                  1
                </div>
                <p className="flex-1 pt-2 text-lg">
                  Describe your event and make a collateral deposit (1/11 of the total amount)
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
                  2
                </div>
                <p className="flex-1 pt-2 text-lg">
                  Tell the restaurant it's your birthday
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
                  3
                </div>
                <p className="flex-1 pt-2 text-lg">
                  Beat the croc
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
                  4
                </div>
                <p className="flex-1 pt-2 text-lg">
                  Voshy will pay for you or take your money
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
