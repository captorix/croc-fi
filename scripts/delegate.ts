import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { setupProvider, getProgram, getGamePda } from "./config";

async function main() {
  console.log("=== Delegate Game Account ===\n");
  
  // Get game index from command line args or use 0 as default
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  
  const provider = setupProvider();
  const program = getProgram(provider);
  const wallet = anchor.Wallet.local();
  
  const gamePda = getGamePda(program.programId, gameIndex);
  
  console.log("Base Layer Connection:", provider.connection.rpcEndpoint);
  console.log("Wallet Public Key:", wallet.publicKey.toString());
  console.log("Game Index:", gameIndex);
  console.log("Game PDA:", gamePda.toString());
  
  console.log(`\nDelegating game #${gameIndex} to ephemeral rollup...`);
  const tx = await program.methods
    .delegate(gameIndex)
    .accounts({
      payer: wallet.publicKey,
    })
    .remainingAccounts([])
    .rpc();
  
  console.log("Transaction signature:", tx);
  console.log(`Game #${gameIndex} delegated successfully!`);
  console.log("\nYou can now play the game on the ephemeral rollup using press-tooth.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
