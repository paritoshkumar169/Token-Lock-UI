import { type AnchorProvider, Program, BN } from "@project-serum/anchor"
import { PublicKey, type Connection, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Import the IDL
const idl = {
  version: "0.1.0",
  name: "token_lock",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "recipient",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "Vault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
}

export class TokenLockProgram {
  private program: Program
  private connection: Connection
  private programId: PublicKey

  constructor(provider: AnchorProvider) {
    this.connection = provider.connection
    this.programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "DNeSEvYcNVwGYruy756J5C2rDMGuTQ2yFhnTkjRHrwYi")
    this.program = new Program(idl as any, this.programId, provider)
  }

  async initialize(authority: PublicKey) {
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), authority.toBuffer()], this.programId)

    return await this.program.methods
      .initialize()
      .accounts({
        vault: vaultPda,
        authority: authority,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  async deposit(user: PublicKey, amount: number) {
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), user.toBuffer()], this.programId)

    const amountLamports = new BN(amount * LAMPORTS_PER_SOL)

    return await this.program.methods
      .deposit(amountLamports)
      .accounts({
        vault: vaultPda,
        user: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  async withdraw(authority: PublicKey, recipient: PublicKey, amount: number) {
    const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), authority.toBuffer()], this.programId)

    const amountLamports = new BN(amount * LAMPORTS_PER_SOL)

    return await this.program.methods
      .withdraw(amountLamports)
      .accounts({
        vault: vaultPda,
        authority: authority,
        recipient: recipient,
      })
      .rpc()
  }
}

