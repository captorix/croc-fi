import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { setupProvider, setupEphemeralProvider, getProgram, getGamePda } from "./config";
import { Croc } from "../target/types/croc";

function displayGameState(game: any, label: string) {
  console.log(`\n${label}:`);
  console.log("  Game Index:", game.gameIndex);
  console.log("  Total Teeth:", game.totalTeeth);
  console.log("  Teeth Pressed:", game.teethPressedCount, "/", game.totalTeeth);
  console.log("  Game Over:", game.gameOver);
  console.log("  Winner:", game.winner ? "Yes" : "No");
  console.log("  Current Tooth:", game.currentTooth);
  
  // Display pressed teeth as a visual bitmap
  const pressedBitmap = game.pressedTeeth.toString(2).padStart(game.totalTeeth, "0");
  console.log("  Pressed Teeth Bitmap:", pressedBitmap);
  
  // Display which teeth are pressed
  const pressedTeeth = [];
  for (let i = 0; i < game.totalTeeth; i++) {
    if ((game.pressedTeeth & (1 << i)) !== 0) {
      pressedTeeth.push(i);
    }
  }
  console.log("  Pressed Teeth Numbers:", pressedTeeth.length > 0 ? pressedTeeth.join(", ") : "None");
  
  if (game.gameOver) {
    if (game.winner) {
      console.log("\n  *** GAME WON! ALL TEETH PRESSED SAFELY! ***");
    } else {
      console.log("\n  *** GAME LOST! CROCODILE BIT YOU! ***");
    }
  }
}

async function main() {
  console.log("=== Check Game Account ===\n");
  
  // Get game index from command line args or use 0 as default
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  
  const provider = setupProvider();
  const providerEphemeralRollup = setupEphemeralProvider();
  const program = getProgram(provider);
  const wallet = anchor.Wallet.local();
  
  const ephemeralProgram = new Program<Croc>(program.idl, providerEphemeralRollup);
  const gamePda = getGamePda(program.programId, gameIndex);
  
  console.log("Wallet Public Key:", wallet.publicKey.toString());
  console.log("Game Index:", gameIndex);
  console.log("Game PDA:", gamePda.toString());
  
  // Try to fetch from base layer
  console.log("\n--- Checking Base Layer ---");
  try {
    const gameBase = await program.account.game.fetch(gamePda);
    displayGameState(gameBase, "Base Layer Game State");
  } catch (error) {
    console.log("  Game account not found on base layer");
  }
  
  // Try to fetch from ephemeral rollup
  console.log("\n--- Checking Ephemeral Rollup ---");
  try {
    const gameEphemeral = await ephemeralProgram.account.game.fetch(gamePda);
    displayGameState(gameEphemeral, "Ephemeral Rollup Game State");
  } catch (error) {
    console.log("  Game account not found on ephemeral rollup");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

