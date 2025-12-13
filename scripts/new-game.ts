import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { setupProvider, setupEphemeralProvider, getProgram, getGamePda } from "./config";
import { Croc } from "../target/types/croc";
import * as fs from "fs";
import { Transaction } from "@solana/web3.js";

async function main() {
  console.log("=== Start New Game (Ephemeral Rollup) ===\n");
  
  // Get game index and optional wallet path from command line args
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  const walletPath = process.argv[3] ? process.argv[3] : null;
  
  const provider = setupProvider();
  const providerEphemeralRollup = setupEphemeralProvider();
  const program = getProgram(provider);
  
  // Load wallet from file path or use default local wallet
  let wallet: anchor.Wallet;
  if (walletPath) {
    if (!fs.existsSync(walletPath)) {
      console.error(`Error: Wallet file not found at ${walletPath}`);
      process.exit(1);
    }
    const keypair = anchor.web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
    );
    wallet = new anchor.Wallet(keypair);
    console.log("Using custom wallet from:", walletPath);
  } else {
    wallet = anchor.Wallet.local();
    console.log("Using local wallet");
  }
  
  const ephemeralProgram = new Program<Croc>(program.idl, providerEphemeralRollup);
  const gamePda = getGamePda(program.programId, gameIndex);
  
  console.log("Ephemeral Rollup Connection:", providerEphemeralRollup.connection.rpcEndpoint);
  console.log("Payer Public Key:", wallet.publicKey.toString());
  console.log("Game Index:", gameIndex);
  console.log("Game PDA:", gamePda.toString());
  
  // Fetch and display current game state
  try {
    const gameAccount = await ephemeralProgram.account.game.fetch(gamePda);
    console.log("\nCurrent Game State:");
    console.log("  Teeth Pressed:", gameAccount.teethPressedCount, "/", gameAccount.totalTeeth);
    console.log("  Game Over:", gameAccount.gameOver);
    console.log("  Pressed Teeth Bitmap:", gameAccount.pressedTeeth.toString(2).padStart(16, "0"));
    
    if (!gameAccount.gameOver) {
      console.log("\n*** ERROR: Game is not over yet! ***");
      console.log("You can only start a new game after the current game is finished.");
      console.log("Keep pressing teeth or wait for the game to end.");
      return;
    }
    
    console.log("\n*** Game is over! Starting new game... ***");
  } catch (error) {
    console.log("\nGame account not found. Please initialize and delegate the game first.");
    return;
  }
  
  console.log(`\nResetting game #${gameIndex}...`);
  const ix = await ephemeralProgram.methods
    .newGame(gameIndex)
    .accounts({
      payer: wallet.publicKey,
    })
    .instruction();
  const tx = new Transaction().add(ix);     
  const blockhash = await providerEphemeralRollup.connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash.blockhash;
  tx.feePayer = wallet.publicKey;
  tx.sign(wallet.payer);
  const signature = await providerEphemeralRollup.connection.sendTransaction(tx, [wallet.payer]);
  console.log("Transaction signature:", signature);
  console.log("New game started successfully!");
  
  // Wait a bit and check the result
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const gameAccountAfter = await ephemeralProgram.account.game.fetch(gamePda);
    console.log("\nNew Game State:");
    console.log("  Teeth Pressed:", gameAccountAfter.teethPressedCount, "/", gameAccountAfter.totalTeeth);
    console.log("  Game Over:", gameAccountAfter.gameOver);
    console.log("  Pressed Teeth Bitmap:", gameAccountAfter.pressedTeeth.toString(2).padStart(16, "0"));
    
    console.log("\n*** Ready to play! Press teeth to start the new game! ***");
  } catch (error) {
    console.log("Could not fetch game state after reset");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

