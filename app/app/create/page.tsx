"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Marquee } from "@/components/marquee"
import { GamepadIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import * as anchor from "@coral-xyz/anchor"
import { Connection, PublicKey } from "@solana/web3.js"
import { ConnectionMagicRouter } from "@magicblock-labs/ephemeral-rollups-sdk"
import { PROGRAM_ID, GAME_SEED, BASE_ENDPOINT } from "@/lib/config"
import { Croc } from "@/lib/idl/croc"
import crocIdl from "@/lib/idl/croc.json"

const deriveGamePda = (gameIndex: number) => {
  const gameIndexBuffer = Buffer.alloc(4)
  gameIndexBuffer.writeUInt32LE(gameIndex, 0)
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_SEED), gameIndexBuffer],
    PROGRAM_ID
  )[0]
}

export default function CreateGame() {
  const router = useRouter()
  const wallet = useWallet()
  const [gameName, setGameName] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [loserAmount, setLoserAmount] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [gameIndex, setGameIndex] = useState<number>(0)

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gameName.trim() || !playerName.trim() || !loserAmount.trim()) {
      return
    }

    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet first!")
      return
    }

    setIsCreating(true)
    try {
      // Setup connection and program
      const connection = new Connection(BASE_ENDPOINT, "confirmed")

      const provider = new anchor.AnchorProvider(
        connection,
        // @ts-ignore
        wallet,
        anchor.AnchorProvider.defaultOptions()
      )
      const program = new anchor.Program<Croc>(crocIdl, provider)

      // Generate random game index
      const randomGameIndex = Math.floor(Math.random() * 1000000000)
      setGameIndex(randomGameIndex)

      const gamePda = deriveGamePda(randomGameIndex)
      console.log("Game Index:", randomGameIndex)
      console.log("Game PDA:", gamePda.toString())

      // Step 1: Initialize game
      console.log("Creating game #", randomGameIndex)
      await program.methods
        .initialize(randomGameIndex)
        .accounts({
          payer: wallet.publicKey,
        })
        .rpc()

      console.log("Game created successfully!")

      // Step 2: Delegate game
      console.log("Delegating game...")

      const routerEndpoint = process.env.NEXT_PUBLIC_ROUTER_ENDPOINT || "https://devnet-router.magicblock.app"
      const routerWsEndpoint = process.env.NEXT_PUBLIC_ROUTER_WS_ENDPOINT || "wss://devnet-router.magicblock.app"
      const routerConnection = new ConnectionMagicRouter(routerEndpoint, {
        wsEndpoint: routerWsEndpoint,
      })

      const validatorResult = await routerConnection.getClosestValidator()
      console.log("Closest validator:", validatorResult)

      const validatorIdentity = validatorResult.identity

      if (!validatorIdentity) {
        throw new Error("Validator identity not found")
      }

      const validatorPubkey = new PublicKey(validatorIdentity)
      const remainingAccounts = [
        {
          pubkey: validatorPubkey,
          isSigner: false,
          isWritable: false,
        },
      ]

      const tx = await program.methods
        .delegate(randomGameIndex)
        .accounts({
          payer: wallet.publicKey,
        })
        .remainingAccounts(remainingAccounts)
        .transaction()

      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = wallet.publicKey
      
      const signedTx = await wallet.signTransaction!(tx)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(signature)
      
      console.log("Transaction signature:", signature)
      console.log("Game delegated successfully!")
      console.log({
        gameName: gameName.trim(),
        playerName: playerName.trim(),
        loserAmount: Number(loserAmount),
        gameIndex: randomGameIndex,
        gamePda: gamePda.toString(),
      })

      // Navigate to the main game
      router.push("/")
    } catch (error) {
      console.error("Error creating game:", error)
      alert("Failed to create game. See console for details.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Marquee direction="left" />

      <main className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <GamepadIcon className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Game</h1>
            <p className="text-muted-foreground">Set up your crocodile dentist game</p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateGame}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border space-y-6"
          >
            {/* Game Name */}
            <div className="space-y-2">
              <Label htmlFor="gameName" className="text-foreground font-medium flex items-center gap-2">
                <GamepadIcon className="w-4 h-4" />
                Game Name
              </Label>
              <Input
                id="gameName"
                type="text"
                placeholder="Enter game name..."
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="bg-secondary border-border"
                required
              />
              <p className="text-xs text-muted-foreground">Choose a unique name for this game session</p>
            </div>

            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-foreground font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Player Name
              </Label>
              <Input
                id="playerName"
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-secondary border-border"
                required
              />
              <p className="text-xs text-muted-foreground">The name of the player creating the game</p>
            </div>

            {/* Loser Amount */}
            <div className="space-y-2">
              <Label htmlFor="loserAmount" className="text-foreground font-medium">
                Loser Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  id="loserAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={loserAmount}
                  onChange={(e) => setLoserAmount(e.target.value)}
                  className="bg-secondary border-border pl-8"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Amount the loser has to pay</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!gameName.trim() || !playerName.trim() || !loserAmount.trim() || isCreating || !wallet.connected}
                className="flex-1 py-6 text-lg font-bold"
              >
                {isCreating ? "Creating..." : !wallet.connected ? "Connect Wallet" : "Create Game"}
              </Button>
            </div>
          </motion.form>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground text-center">
              After creating the game, you can invite other players to join and compete for the stakes!
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Marquee direction="right" />
    </div>
  )
}
