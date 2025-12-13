# Croc Dentist Game Scripts

This directory contains scripts to interact with the Croc Dentist game on Solana using Ephemeral Rollups.

## Game Overview

Croc Dentist is a game where you press the crocodile's teeth one by one. Each tooth has a probability of being the "bad tooth" that makes the crocodile bite. The game uses VRF (Verifiable Random Function) to determine which tooth is bad, ensuring fairness.

Multiple games can be created with different indices. Each game is shared - any player can press teeth in any game!

## Setup

1. Make sure you have a wallet configured (Anchor default wallet or `user.json` in the project root)
2. Ensure you have SOL on devnet for transactions
3. Install dependencies: `npm install` or `yarn install`

## Scripts

### 1. Initialize Game

Initialize a new Croc Dentist game on the base layer.

```bash
npx tsx scripts/initialize.ts [game_index]
```

Arguments:
- `game_index` (optional): Game number to create (0, 1, 2, ...). Default: 0

Examples:
```bash
# Initialize game #0 (default)
npx tsx scripts/initialize.ts

# Initialize game #5
npx tsx scripts/initialize.ts 5
```

### 2. Delegate Game

Delegate the game account to the ephemeral rollup for fast, low-cost gameplay.

```bash
npx tsx scripts/delegate.ts [game_index]
```

Arguments:
- `game_index` (optional): Which game to delegate. Default: 0

Examples:
```bash
# Delegate game #0
npx tsx scripts/delegate.ts

# Delegate game #5
npx tsx scripts/delegate.ts 5
```

### 3. Press Tooth

Press a tooth in the game. This uses the ephemeral rollup for instant feedback.

```bash
npx tsx scripts/press-tooth.ts [game_index] [tooth_index] [client_seed] [wallet_path]
```

Arguments:
- `game_index` (optional): Which game to play (0, 1, 2, ...). Default: 0
- `tooth_index` (optional): Which tooth to press (0-15). Default: 0
- `client_seed` (optional): Random seed for VRF. Default: random
- `wallet_path` (optional): Path to wallet keypair JSON file. Default: local Anchor wallet

Examples:
```bash
# Press tooth #5 in game #0 with random seed (using local wallet)
npx tsx scripts/press-tooth.ts 0 5

# Press tooth #10 in game #2 with specific seed
npx tsx scripts/press-tooth.ts 2 10 42

# Press tooth #0 in game #0 (all defaults)
npx tsx scripts/press-tooth.ts

# Press tooth #3 in game #1 using a custom wallet file
npx tsx scripts/press-tooth.ts 1 3 123 ./my-wallet.json

# Press tooth #7 in game #0 using user.json wallet
npx tsx scripts/press-tooth.ts 0 7 42 ./user.json
```

### 4. Start New Game

After a game is over, start a new game without undelegating. This resets the game state while keeping it on the ephemeral rollup.

```bash
npx tsx scripts/new-game.ts [game_index] [wallet_path]
```

Arguments:
- `game_index` (optional): Which game to reset (0, 1, 2, ...). Default: 0
- `wallet_path` (optional): Path to wallet keypair JSON file. Default: local Anchor wallet

Examples:
```bash
# Start new game #0 after it's over (using local wallet)
npx tsx scripts/new-game.ts

# Start new game #5
npx tsx scripts/new-game.ts 5

# Start new game #1 using user.json wallet
npx tsx scripts/new-game.ts 1 ./user.json
```

Note: This can only be called when the game is over (won or lost). The game must be delegated to the ephemeral rollup.

### 5. Check Game

Check the current state of a game on both base layer and ephemeral rollup.

```bash
npx tsx scripts/check-game.ts [game_index]
```

Arguments:
- `game_index` (optional): Which game to check. Default: 0

Examples:
```bash
# Check game #0
npx tsx scripts/check-game.ts

# Check game #5
npx tsx scripts/check-game.ts 5
```

### 6. Undelegate Game

Commit the game state from the ephemeral rollup back to the base layer.

```bash
npx tsx scripts/undelegate.ts [game_index]
```

Arguments:
- `game_index` (optional): Which game to undelegate. Default: 0

Examples:
```bash
# Undelegate game #0
npx tsx scripts/undelegate.ts

# Undelegate game #5
npx tsx scripts/undelegate.ts 5
```

## Typical Workflow

1. **Initialize**: Create a new game (e.g., game #1)
   ```bash
   npx tsx scripts/initialize.ts 1
   ```

2. **Delegate**: Move game to ephemeral rollup for fast play
   ```bash
   npx tsx scripts/delegate.ts 1
   ```

3. **Play**: Press teeth until you win or lose (anyone can play!)
   ```bash
   # Player 1 presses tooth #0 in game #1
   npx tsx scripts/press-tooth.ts 1 0
   
   # Player 2 presses tooth #5 in game #1
   npx tsx scripts/press-tooth.ts 1 5
   
   # Player 1 presses tooth #12 in game #1
   npx tsx scripts/press-tooth.ts 1 12
   # ... continue playing
   ```

4. **Check Status**: View game state anytime
   ```bash
   npx tsx scripts/check-game.ts 1
   ```

5. **Play Again** (Optional): If game is over, start a new game without undelegating
   ```bash
   npx tsx scripts/new-game.ts 1
   # Now you can press teeth again!
   npx tsx scripts/press-tooth.ts 1 8
   ```

6. **Undelegate**: Commit final state back to base layer (when done playing)
   ```bash
   npx tsx scripts/undelegate.ts 1
   ```

## Continuous Play Session

After a game ends, you can immediately start a new game without undelegating:

```bash
# Initialize and delegate once
npx tsx scripts/initialize.ts 0
npx tsx scripts/delegate.ts 0

# Play first game
npx tsx scripts/press-tooth.ts 0 5
npx tsx scripts/press-tooth.ts 0 10
# ... game ends (won or lost)

# Start new game immediately (no undelegate needed!)
npx tsx scripts/new-game.ts 0

# Play second game
npx tsx scripts/press-tooth.ts 0 3
npx tsx scripts/press-tooth.ts 0 7
# ... game ends again

# Start another new game
npx tsx scripts/new-game.ts 0

# Play third game
npx tsx scripts/press-tooth.ts 0 12
# ... and so on!

# When done playing, undelegate once
npx tsx scripts/undelegate.ts 0
```

## Multiple Games

You can have multiple games running at the same time:

```bash
# Create and play game #0
npx tsx scripts/initialize.ts 0
npx tsx scripts/delegate.ts 0
npx tsx scripts/press-tooth.ts 0 3

# Create and play game #1
npx tsx scripts/initialize.ts 1
npx tsx scripts/delegate.ts 1
npx tsx scripts/press-tooth.ts 1 7

# Create and play game #100
npx tsx scripts/initialize.ts 100
npx tsx scripts/delegate.ts 100
npx tsx scripts/press-tooth.ts 100 15
```

## Game Rules

- Each game is identified by a unique index (0, 1, 2, ...)
- Each game has 16 teeth (numbered 0-15)
- Any player can press any tooth in any game (it's a shared game!)
- Each unpressed tooth has a probability of being the bad tooth
- The probability adjusts as you press teeth: 1/(remaining teeth)
- If you press the bad tooth, the game is lost
- If all teeth are pressed without hitting the bad one, the game is won
- You cannot press the same tooth twice in one game
- After a game ends, you can reset it with `new-game.ts` to play again (while delegated)

## Environment Variables

- `ANCHOR_PROVIDER_URL`: Base layer RPC endpoint (default: devnet)
- `PROVIDER_ENDPOINT`: Ephemeral rollup HTTP endpoint (default: https://devnet.magicblock.app/)
- `WS_ENDPOINT`: Ephemeral rollup WebSocket endpoint (default: wss://devnet.magicblock.app/)

## Notes

- The game uses VRF callbacks, so there's a slight delay (2-3 seconds) after pressing a tooth
- The `press-tooth.ts` script automatically waits and shows the result
- You can only play the game (press teeth) when it's delegated to the ephemeral rollup
- After a game ends, you can start a new game with `new-game.ts` without needing to undelegate and delegate again
- This allows for continuous play sessions on the ephemeral rollup without going back to the base layer
- The game state is a PDA derived from the game index (shared by all players)
