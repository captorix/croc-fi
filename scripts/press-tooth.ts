import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { setupProvider, setupEphemeralProvider, getProgram, getGamePda } from "./config";
import { Croc } from "../target/types/croc";
import * as fs from "fs";
import { Transaction } from "@solana/web3.js";

async function main() {
  console.log("=== Press Tooth (Ephemeral Rollup) ===\n");
  
  // Get game index, tooth index, client seed and optional wallet path from command line args
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  const toothIndex = process.argv[3] ? parseInt(process.argv[3]) : 0;
  const clientSeed = process.argv[4] ? parseInt(process.argv[4]) : Math.floor(Math.random() * 256);
  const walletPath = process.argv[5] ? process.argv[5] : null;
  
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
  console.log("Tooth Index:", toothIndex);
  console.log("Client Seed:", clientSeed);
  
  // Fetch and display current game state
  try {
    const gameAccount = await ephemeralProgram.account.game.fetch(gamePda);
    console.log("\nCurrent Game State:");
    console.log("  Teeth Pressed:", gameAccount.teethPressedCount, "/", gameAccount.totalTeeth);
    console.log("  Game Over:", gameAccount.gameOver);
    console.log("  Pressed Teeth Bitmap:", gameAccount.pressedTeeth.toString(2).padStart(16, "0"));
    
    if (gameAccount.gameOver) {
      console.log("\n*** GAME IS ALREADY OVER ***");
      if (gameAccount.winner) {
        console.log("Result: YOU WON!");
      } else {
        console.log("Result: YOU LOST!");
      }
      return;
    }
    
    // Check if this tooth was already pressed
    const toothMask = 1 << toothIndex;
    if ((gameAccount.pressedTeeth & toothMask) !== 0) {
      console.log(`\nTooth #${toothIndex} has already been pressed!`);
      return;
    }
  } catch (error) {
    console.log("\nGame account not found. Please initialize the game first.");
    return;
  }
  
  console.log(`\nPressing tooth #${toothIndex} in game #${gameIndex}...`);
  console.log("Payer Public Key:", wallet.publicKey.toString());
  const ix = await ephemeralProgram.methods
    .pressToothDelegated(gameIndex, toothIndex, clientSeed)
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
  console.log("Tooth pressed successfully!");
  console.log("\nWaiting for VRF callback to execute...");
  
  // Wait a bit and check the result
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    const gameAccountAfter = await ephemeralProgram.account.game.fetch(gamePda);
    console.log("\nGame State After:");
    console.log("  Teeth Pressed:", gameAccountAfter.teethPressedCount, "/", gameAccountAfter.totalTeeth);
    console.log("  Game Over:", gameAccountAfter.gameOver);
    console.log("  Pressed Teeth Bitmap:", gameAccountAfter.pressedTeeth.toString(2).padStart(16, "0"));
    
    if (gameAccountAfter.gameOver) {
      if (gameAccountAfter.winner) {
        console.log("\n*** CONGRATULATIONS! YOU WON! ***");
      } else {
        console.log("\n*** CHOMP! GAME OVER! ***");
      }
    } else {
      console.log("\n*** SAFE! Keep going... ***");
    }
  } catch (error) {
    console.log("Could not fetch game state after press");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
