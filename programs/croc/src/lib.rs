use anchor_lang::prelude::*;
use ephemeral_vrf_sdk::anchor::vrf;
use ephemeral_vrf_sdk::instructions::{create_request_randomness_ix, RequestRandomnessParams};
use ephemeral_vrf_sdk::types::SerializableAccountMeta;
use ephemeral_rollups_sdk::anchor::{delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;


declare_id!("F91YBp47Bk8MVGNnPK3edQfrwJLv9eDWRXzfHiVUXk4k");


pub const GAME_SEED: &[u8] = b"croc_dent_game";
pub const TOTAL_TEETH: u8 = 10;

#[ephemeral]
#[program]
pub mod croc {
    use super::*;

    /// Initialize a new Croc Dentist game
    pub fn initialize(ctx: Context<Initialize>, game_index: u32) -> Result<()> {
        msg!("Initializing Croc Dentist game #{}: {:?}", game_index, ctx.accounts.game.key());
        let game = &mut ctx.accounts.game;
        game.game_index = game_index;
        game.pressed_teeth = 0;
        game.total_teeth = TOTAL_TEETH;
        game.game_over = false;
        game.teeth_pressed_count = 0;
        msg!("Game #{} initialized with {} teeth", game_index, TOTAL_TEETH);
        Ok(())
    }

    /// Press a tooth - delegated version for ephemeral rollups
    /// game_index: which game to play
    /// tooth_index: which tooth to press (0 to TOTAL_TEETH-1)
    /// client_seed: random seed from client for VRF
    pub fn press_tooth_delegated(
        ctx: Context<PressToothDelegatedCtx>, 
        _game_index: u32,
        tooth_index: u8,
        client_seed: u8,
    ) -> Result<()> {
        // Initial validation
        require!(!ctx.accounts.game.game_over, ErrorMessage::GameAlreadyOver);
        require!(tooth_index < ctx.accounts.game.total_teeth, ErrorMessage::InvalidToothIndex);
        
        // Check if tooth already pressed
        let tooth_mask = 1u16 << tooth_index;
        require!(
            (ctx.accounts.game.pressed_teeth & tooth_mask) == 0,
            ErrorMessage::ToothAlreadyPressed
        );
        
        msg!("Player pressing tooth #{}", tooth_index);
        
        // Store current tooth for VRF callback
        let game_key = {
            let game = &mut ctx.accounts.game;
            game.current_tooth = tooth_index;
            game.key()
        };
        
        // Request VRF to check this tooth with 1/teeth_left probability
        let ix = create_request_randomness_ix(RequestRandomnessParams {
            payer: ctx.accounts.payer.key(),
            oracle_queue: ctx.accounts.oracle_queue.key(),
            callback_program_id: ID,
            callback_discriminator: instruction::CallbackCheckTooth::DISCRIMINATOR.to_vec(),
            caller_seed: [client_seed; 32],
            accounts_metas: Some(vec![SerializableAccountMeta {
                pubkey: game_key,
                is_signer: false,
                is_writable: true,
            }]),
            ..Default::default()
        });
        
        ctx.accounts
            .invoke_signed_vrf(&ctx.accounts.payer.to_account_info(), &ix)?;
        
        Ok(())
    }

    /// VRF callback to check the pressed tooth
    /// Each tooth has 1/teeth_left probability of being the bad tooth
    pub fn callback_check_tooth(
        ctx: Context<CallbackCheckToothCtx>,
        randomness: [u8; 32],
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let tooth_index = game.current_tooth;
        
        // Calculate how many teeth are left (not pressed yet)
        let teeth_left = game.total_teeth - game.teeth_pressed_count;
        
        msg!("Checking tooth #{} with {}/{} probability", 
            tooth_index, 1, teeth_left);
        
        // Generate random number from 1 to teeth_left
        // If it's 1, this is the bad tooth!
        let random_result = ephemeral_vrf_sdk::rnd::random_u8_with_range(
            &randomness, 
            1, 
            teeth_left
        );
        
        // Mark tooth as pressed
        let tooth_mask = 1u16 << tooth_index;
        game.pressed_teeth |= tooth_mask;
        game.teeth_pressed_count += 1;
        
        // Check if this tooth bites (random_result == 1)
        if random_result == 1 {
            msg!("CHOMP! Tooth #{} bit you!", tooth_index);
            msg!("Game Over! You lose!");
            game.game_over = true;
        } else {
            msg!("Safe! Tooth #{} didn't bite (rolled {})", tooth_index, random_result);
            
            // Check if this was the last tooth
            if game.teeth_pressed_count >= game.total_teeth {
                msg!("All teeth pressed! You win!");
                game.game_over = true;
            }
        }
        
        Ok(())
    }

    /// Delegate the game account to use the VRF in the ephemeral rollups
    pub fn delegate(ctx: Context<DelegateInput>, game_index: u32) -> Result<()> {
        msg!("Delegating game #{}", game_index);
        msg!("Payer: {:?}", ctx.accounts.payer.key());

        ctx.accounts.delegate_game(
            &ctx.accounts.payer,
            &[GAME_SEED, &game_index.to_le_bytes()],
            DelegateConfig {
                validator: ctx.remaining_accounts.first().map(|acc| acc.key()),
                ..Default::default()
            },
        )?;
        msg!("Delegation successful for game #{}: {:?}", game_index, ctx.accounts.game.key());
        Ok(())
    }

    /// Start a new game after the current one is over
    /// Resets game state without undelegating
    pub fn new_game(ctx: Context<NewGame>, _game_index: u32) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        // Only allow new game if current game is over
        require!(game.game_over, ErrorMessage::GameNotOver);
        
        msg!("Starting new game for game #{}", game.game_index);
        
        // Reset game state
        game.pressed_teeth = 0;
        game.teeth_pressed_count = 0;
        game.game_over = false;
        game.current_tooth = 0;
        
        msg!("New game started! Game #{} reset with {} teeth", game.game_index, game.total_teeth);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(game_index: u32)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed, 
        payer = payer, 
        space = 8 + Game::INIT_SPACE, 
        seeds = [GAME_SEED, &game_index.to_le_bytes()], 
        bump
    )]
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[vrf]
#[derive(Accounts)]
#[instruction(game_index: u32)]
pub struct PressToothDelegatedCtx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [GAME_SEED, &game_index.to_le_bytes()], bump)]
    pub game: Account<'info, Game>,
    /// CHECK: The oracle queue
    #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_EPHEMERAL_QUEUE)]
    pub oracle_queue: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CallbackCheckToothCtx<'info> {
    /// This check ensures that the vrf_program_identity (which is a PDA) is a signer
    /// enforcing the callback is executed by the VRF program through CPI
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,
    #[account(mut)]
    pub game: Account<'info, Game>,
}

#[delegate]
#[derive(Accounts)]
#[instruction(game_index: u32)]
pub struct DelegateInput<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: The PDA to delegate
    #[account(mut, del, seeds = [GAME_SEED, &game_index.to_le_bytes()], bump)]
    pub game: Account<'info, Game>,
}

#[derive(Accounts)]
#[instruction(game_index: u32)]
pub struct NewGame<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [GAME_SEED, &game_index.to_le_bytes()], bump)]
    pub game: Account<'info, Game>,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    /// Game index identifier
    pub game_index: u32,
    /// Bitmap of pressed teeth (bit set = tooth pressed)
    pub pressed_teeth: u16,
    /// Total number of teeth in the game
    pub total_teeth: u8,
    /// Whether the game is over
    pub game_over: bool,
    /// Count of teeth pressed
    pub teeth_pressed_count: u8,
    /// Current tooth being checked (for VRF callback)
    pub current_tooth: u8,
}

#[error_code]
pub enum ErrorMessage {
    #[msg("Game is already over")]
    GameAlreadyOver,
    #[msg("Invalid tooth index")]
    InvalidToothIndex,
    #[msg("Tooth has already been pressed")]
    ToothAlreadyPressed,
    #[msg("Game is not over yet")]
    GameNotOver,
}