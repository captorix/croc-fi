'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { walletAdapterFrom, loadOrCreateKeypair } from "@/lib/solana-utils";
import { PLAYER_STORAGE_KEY } from "@/lib/config";
import IDL from '@/lib/idl/croc.json';

const GAME_SEED = "croc_dent_game";
const PROGRAM_ID = new PublicKey("F91YBp47Bk8MVGNnPK3edQfrwJLv9eDWRXzfHiVUXk4k");
const EPHEMERAL_ROLLUP_ENDPOINT = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || "https://devnet.magicblock.app/";
const EPHEMERAL_ROLLUP_WS = process.env.NEXT_PUBLIC_WS_ENDPOINT || "wss://devnet.magicblock.app/";

// Helper to get game PDA
function getGamePda(programId: PublicKey, gameIndex: number = 0): PublicKey {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32LE(gameIndex, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_SEED), indexBuffer],
    programId
  )[0];
}

// Press tooth on-chain using ephemeral rollup
async function pressToothOnChain(
  wallet: any,
  gameIndex: number,
  toothIndex: number,
  clientSeed: number
) {
  // Create ephemeral rollup connection
  const ephemeralConnection = new Connection(
    EPHEMERAL_ROLLUP_ENDPOINT,
    {
      wsEndpoint: EPHEMERAL_ROLLUP_WS,
      commitment: 'confirmed'
    }
  );

  // Create provider for ephemeral rollup
  const ephemeralProvider = new AnchorProvider(
    ephemeralConnection,
    wallet,
    { commitment: 'confirmed' }
  );

  // Create program instance with IDL
  const ephemeralProgram = new Program(
    IDL as any,
    ephemeralProvider
  );

  const gamePda = getGamePda(PROGRAM_ID, gameIndex);

  console.log('Game PDA:', gamePda.toString());
  console.log('Payer:', wallet.publicKey.toString());
  console.log('Tooth Index:', toothIndex);
  console.log('Client Seed:', clientSeed);

  // Create instruction for pressToothDelegated
  const ix = await ephemeralProgram.methods
    .pressToothDelegated(gameIndex, toothIndex, clientSeed)
    .accounts({
      payer: wallet.publicKey,
    })
    .instruction();

  // Create and prepare transaction
  const tx = new Transaction().add(ix);
  const blockhash = await ephemeralConnection.getLatestBlockhash();
  tx.recentBlockhash = blockhash.blockhash;
  tx.feePayer = wallet.publicKey;

  // Sign transaction
  const signedTx = await wallet.signTransaction(tx);

  // Send transaction
  const signature = await ephemeralConnection.sendRawTransaction(
    signedTx.serialize(),
    { skipPreflight: false }
  );

  console.log('Transaction signature:', signature);

  // Wait for VRF callback to execute
  console.log('Waiting for VRF callback...');
  // await new Promise(resolve => setTimeout(resolve, 3000));

  // Fetch game state after press
  // @ts-ignore
  const gameAccount = await ephemeralProgram.account.game.fetch(gamePda);

  console.log('Game state after press:', {
    gameOver: gameAccount.gameOver,
    teethPressed: gameAccount.teethPressedCount,
    totalTeeth: gameAccount.totalTeeth,
  });

  return {
    gameOver: gameAccount.gameOver,
    winner: gameAccount.winner !== undefined ? gameAccount.winner : !gameAccount.gameOver,
    teethPressed: gameAccount.teethPressedCount,
    totalTeeth: gameAccount.totalTeeth,
  };
}

// Load game state from on-chain
async function loadGameState(gameIndex: number = 0) {
  try {
    const ephemeralConnection = new Connection(
      EPHEMERAL_ROLLUP_ENDPOINT,
      {
        wsEndpoint: EPHEMERAL_ROLLUP_WS,
        commitment: 'confirmed'
      }
    );

    const gamePda = getGamePda(PROGRAM_ID, gameIndex);

    // Create a temporary provider (we don't need wallet for reading)
    const ephemeralProvider = new AnchorProvider(
      ephemeralConnection,
      {} as any, // dummy wallet for reading
      { commitment: 'confirmed' }
    );

    const ephemeralProgram = new Program(
      IDL as any,
      ephemeralProvider
    );
    // @ts-ignore
    const gameAccount = await ephemeralProgram.account.game.fetch(gamePda);

    console.log('Loaded game state:', {
      gameOver: gameAccount.gameOver,
      teethPressed: gameAccount.teethPressedCount,
      totalTeeth: gameAccount.totalTeeth,
      pressedTeethBitmap: gameAccount.pressedTeeth.toString(2).padStart(16, '0'),
    });

    // Parse pressed teeth from bitmap
    const pressedTeethSet = new Set<string>();
    for (let i = 0; i < gameAccount.totalTeeth; i++) {
      const toothMask = 1 << i;
      if ((gameAccount.pressedTeeth & toothMask) !== 0) {
        // Convert tooth index to tooth ID (e.g., 0 -> "tooth-1", 1 -> "tooth-2")
        pressedTeethSet.add(`tooth-${i + 1}`);
      }
    }

    return {
      gameAccount,
      pressedTeethSet,
    };
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

// Tooth positions (x, y coordinates)
const TEETH_POSITIONS = [
  { id: 'tooth-3', x: 283, y: 1182 },
  { id: 'tooth-2', x: 404, y: 1203 },
  { id: 'tooth-5', x: 177, y: 1139 },
  { id: 'tooth-4', x: 159, y: 1059 },
  { id: 'tooth-1', x: 172, y: 973 },
  { id: 'tooth-6', x: 549, y: 1203 },
  { id: 'tooth-9', x: 778, y: 1139 },
  { id: 'tooth-10', x: 797, y: 1060 },
  { id: 'tooth-7', x: 781, y: 972 },
  { id: 'tooth-8', x: 673, y: 1180 },
];

export function useCrocodileGame() {
  const [clickedTooth, setClickedTooth] = useState<string | null>(null);
  const [removedTeeth, setRemovedTeeth] = useState<Set<string>>(new Set());
  const [gameLost, setGameLost] = useState(false);
  const [showCrapOverlay, setShowCrapOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const localKeypairRef = useRef<Keypair | null>(null);
  const localWalletRef = useRef<any>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loseAudioRef.current = new Audio('/croc_sound.mp3');
      loseAudioRef.current.volume = 1;
    }
  }, []);

  // Initialize local wallet and load game state
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Load or create local keypair
          if (!localKeypairRef.current) {
            localKeypairRef.current = loadOrCreateKeypair(PLAYER_STORAGE_KEY);
          }

          // Create wallet adapter from local keypair
          localWalletRef.current = walletAdapterFrom(localKeypairRef.current);

          console.log('Local wallet initialized:', localKeypairRef.current.publicKey.toString());

          // Load game state after wallet is initialized
          const result = await loadGameState(0);
          if (result) {
            const { gameAccount, pressedTeethSet } = result;
            setRemovedTeeth(pressedTeethSet);

            // Check if game is over
            if (gameAccount.gameOver) {
              // Check if player won or lost
              const won = gameAccount.teethPressedCount === gameAccount.totalTeeth - 1;
              if (!won) {
                setGameLost(true);
                setShowCrapOverlay(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initializeWallet();
  }, []);

  // Handle tooth click
  const handleToothClick = async (toothId: string) => {
    if (gameLost || isProcessing) return;

    setIsProcessing(true);
    setClickedTooth(toothId);

    try {
      // Generate random client seed (0-255)
      const clientSeed = Math.floor(Math.random() * 256);

      // Extract tooth index from toothId (e.g., "tooth-3" -> 2, zero-indexed)
      const toothIndex = parseInt(toothId.split('-')[1]) - 1;
      const gameIndex = 0; // Default game index

      console.log('Pressing tooth on-chain for tooth:', toothIndex, 'with seed:', clientSeed);
      toast.info('Pressing tooth on-chain...', { duration: 1000 });

      let isBadTooth = false;

      // Use on-chain VRF if local wallet is available
      if (localWalletRef.current) {
        try {
          const result = await pressToothOnChain(
            localWalletRef.current,
            gameIndex,
            toothIndex,
            clientSeed
          );

          console.log('On-chain result:', result);
          isBadTooth = result.gameOver && !result.winner;
        } catch (onChainError) {
          console.error('On-chain call failed:', onChainError);
          toast.error('Failed to process on-chain. Please try again.', {
            duration: 3000,
          });
          setIsProcessing(false);
          return;
        }
      } else {
        toast.error('Wallet not initialized. Please refresh the page.', {
          duration: 3000,
        });
        setIsProcessing(false);
        return;
      }

      // Update removed teeth
      setRemovedTeeth(prev => new Set(prev).add(toothId));

      if (isBadTooth) {
        console.log('Game lost! Clicked on bad tooth:', toothId);
        setGameLost(true);
        // Play lose sound
        if (loseAudioRef.current) {
          loseAudioRef.current.currentTime = 0;
          loseAudioRef.current.play().catch(err => console.error('Error playing sound:', err));
        }
        // Show CRAP overlay after 0.5 seconds
        setTimeout(() => {
          setShowCrapOverlay(true);
        }, 500);
        toast.error('Game Over! You clicked on the bad tooth!', {
          duration: 3000,
        });
      } else {
        console.log('Safe! Removed tooth:', toothId);
        toast.success(`Safe! Removed tooth #${toothId}`, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error pressing tooth:', error);
      toast.error('Failed to press tooth. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle retry/new game
  const handleRetry = async () => {
    try {
      setIsProcessing(true);

      if (!localWalletRef.current) {
        toast.error('Wallet not initialized. Please refresh the page.', {
          duration: 3000,
        });
        setIsProcessing(false);
        return;
      }

      const gameIndex = 0;

      // Create ephemeral rollup connection
      const ephemeralConnection = new Connection(
        EPHEMERAL_ROLLUP_ENDPOINT,
        {
          wsEndpoint: EPHEMERAL_ROLLUP_WS,
          commitment: 'confirmed'
        }
      );

      // Create provider for ephemeral rollup
      const ephemeralProvider = new AnchorProvider(
        ephemeralConnection,
        localWalletRef.current,
        { commitment: 'confirmed' }
      );

      // Create program instance with IDL
      const ephemeralProgram = new Program(
        IDL as any,
        ephemeralProvider
      );

      const gamePda = getGamePda(PROGRAM_ID, gameIndex);

      console.log('Starting new game...');
      toast.info('Starting new game...', { duration: 1000 });

      // Call newGame instruction
      const ix = await ephemeralProgram.methods
        .newGame(gameIndex)
        .accounts({
          payer: localWalletRef.current.publicKey,
          game: gamePda,
        })
        .instruction();

      const tx = new Transaction().add(ix);
      const blockhash = await ephemeralConnection.getLatestBlockhash();
      tx.recentBlockhash = blockhash.blockhash;
      tx.feePayer = localWalletRef.current.publicKey;

      const signedTx = await localWalletRef.current.signTransaction(tx);
      const signature = await ephemeralConnection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: false }
      );

      console.log('New game transaction signature:', signature);

      // Wait a bit for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset UI state
      setGameLost(false);
      setShowCrapOverlay(false);
      setRemovedTeeth(new Set());
      setClickedTooth(null);

      toast.success('New game started!', { duration: 2000 });

    } catch (error) {
      console.error('Failed to start new game:', error);
      toast.error('Failed to start new game. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // State
    clickedTooth,
    removedTeeth,
    gameLost,
    showCrapOverlay,
    isProcessing,
    teethPositions: TEETH_POSITIONS,
    
    // Actions
    handleToothClick,
    handleRetry,
  };
}
