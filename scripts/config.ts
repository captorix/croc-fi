import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { Croc } from "../target/types/croc";
import * as fs from "fs";
import * as path from "path";

export const GAME_SEED = "croc_dent_game";

export function setupProvider() {
  // Use environment variable or default to devnet
  const endpoint = process.env.ANCHOR_PROVIDER_URL || clusterApiUrl("devnet");
  
  // Load wallet from user.json or use default Anchor wallet
  let wallet: anchor.Wallet;
  const walletPath = path.join(process.cwd(), "user.json");
  
  if (fs.existsSync(walletPath)) {
    const keypair = anchor.web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
    );
    wallet = new anchor.Wallet(keypair);
  } else {
    wallet = anchor.Wallet.local();
  }
  
  const connection = new Connection(endpoint, "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  
  anchor.setProvider(provider);
  return provider;
}

export function setupEphemeralProvider() {
  return new anchor.AnchorProvider(
    new anchor.web3.Connection(
      process.env.PROVIDER_ENDPOINT || "https://devnet.magicblock.app/",
      {
        wsEndpoint: process.env.WS_ENDPOINT || "wss://devnet.magicblock.app/",
      }
    ),
    anchor.Wallet.local()
  );
}

export function getProgram(provider: anchor.AnchorProvider): Program<Croc> {
  return anchor.workspace.Croc as Program<Croc>;
}

export function getGamePda(programId: PublicKey, gameIndex: number = 0): PublicKey {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32LE(gameIndex, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GAME_SEED), indexBuffer],
    programId
  )[0];
}
