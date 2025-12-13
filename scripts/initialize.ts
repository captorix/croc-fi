import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { setupProvider, getProgram, getGamePda } from "./config";

async function main() {
  console.log("=== Initialize Croc Dentist Game ===\n");
  
  // Get game index from command line args or use 0 as default
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  
  const provider = setupProvider();
  const program = getProgram(provider);
  const wallet = anchor.Wallet.local();
  
  const gamePda = getGamePda(program.programId, gameIndex);
  
  console.log("Base Layer Connection:", provider.connection.rpcEndpoint);
  console.log("Wallet Public Key:", wallet.publicKey.toString());
  console.log("Game Index:", gameIndex);
  console.log("Game PDA (shared for all players):", gamePda.toString());
  
  const balance = await provider.connection.getBalance(wallet.publicKey);
  console.log("Current balance:", balance / LAMPORTS_PER_SOL, "SOL\n");
  
  console.log(`Initializing Croc Dentist game #${gameIndex}...`);
  const tx = await program.methods
    .initialize(gameIndex)
    .accounts({
      payer: wallet.publicKey,
    })
    .rpc();
  
  console.log("Transaction signature:", tx);
  console.log(`Game #${gameIndex} initialized successfully!`);
  console.log("\nGame has 10 teeth. Don't press the wrong one!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
