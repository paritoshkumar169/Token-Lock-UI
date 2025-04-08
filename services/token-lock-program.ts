import {
  AnchorProvider,
  Program,
  web3,
  BN,
  Idl,
} from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import idl from "@/idl/token_lock.json";
import { LockFormData } from "@/types";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

export class TokenLockProgram {
  provider: AnchorProvider;
  program: Program;

  constructor(provider: AnchorProvider) {
    this.provider = provider;
    this.program = new Program(idl as Idl, PROGRAM_ID, provider);
  }

  async getVaultAddress(authority: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), authority.toBuffer()],
      PROGRAM_ID
    );
  }

  async initialize(authority: PublicKey): Promise<void> {
    const [vaultPDA, bump] = await this.getVaultAddress(authority);

    try {
      await this.program.account.vault.fetch(vaultPDA);
      console.log("Vault already initialized.");
    } catch (err) {
      console.log("Vault not found. Initializing...");

      await this.program.methods
        .initialize()
        .accounts({
          vault: vaultPDA,
          authority,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Vault initialized ✅");
    }
  }

  async deposit(authority: PublicKey, amountSol: number): Promise<string> {
    const [vaultPDA] = await this.getVaultAddress(authority);
    const amountLamports = web3.LAMPORTS_PER_SOL * amountSol;

    const txSig = await this.program.methods
      .deposit(new BN(amountLamports))
      .accounts({
        vault: vaultPDA,
        user: authority,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Deposit successful:", txSig);
    return txSig;
  }

  async getVaultInfo(authority: PublicKey) {
    const [vaultPDA] = await this.getVaultAddress(authority);

    try {
      const vaultAccount = await this.program.account.vault.fetch(vaultPDA) as any;
      console.log("vaultAccount:", vaultAccount);

      return {
        vaultAddress: vaultPDA,
        balanceLamports: vaultAccount.balance ? vaultAccount.balance.toNumber() : 0,
        authority: vaultAccount.authority,
      };
    } catch (err) {
      console.error("Vault not found:", err);
      return null;
    }
  }
}
