import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { setupProvider, setupEphemeralProvider, getProgram, getGamePda } from "./config";
import { Croc } from "../target/types/croc";

async function main() {
  console.log("=== Undelegate Game Account ===\n");
  
  // Get game index from command line args or use 0 as default
  const gameIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;
  
  const provider = setupProvider();
  const providerEphemeralRollup = setupEphemeralProvider();
  const program = getProgram(provider);
  const wallet = anchor.Wallet.local();
  
  const ephemeralProgram = new Program<Croc>(program.idl, providerEphemeralRollup);
  const gamePda = getGamePda(program.programId, gameIndex);
  
  console.log("Ephemeral Rollup Connection:", providerEphemeralRollup.connection.rpcEndpoint);
  console.log("Wallet Public Key:", wallet.publicKey.toString());
  console.log("Game Index:", gameIndex);
  console.log("Game PDA:", gamePda.toString());
  
  console.log(`\nUndelegating game #${gameIndex} (committing to base layer)...`);
  const tx = await ephemeralProgram.methods
    .undelegate(gameIndex)
    .accounts({
      payer: wallet.publicKey,
    })
    .rpc({ skipPreflight: true });
  
  console.log("Transaction signature:", tx);
  console.log(`Game #${gameIndex} undelegated successfully!`);
  console.log("\nGame state has been committed back to the base layer.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
