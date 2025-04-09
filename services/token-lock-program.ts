import { AnchorProvider, Program, web3, BN, Idl } from "@project-serum/anchor"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import idl from "@/idl/token_lock.json"
import { type LockFormData, PermissionType } from "@/types"


if (!process.env.NEXT_PUBLIC_PROGRAM_ID) {
  throw new Error("NEXT_PUBLIC_PROGRAM_ID is not set in environment variables.")
}

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID)

export class TokenLockProgram {
  provider: AnchorProvider
  program: Program

  constructor(provider: AnchorProvider) {
    this.provider = provider
    this.program = new Program(idl as Idl, PROGRAM_ID, provider)
  }

  async getVaultAddress(authority: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), authority.toBuffer()],
      PROGRAM_ID
    )
  }

  async initialize(authority: PublicKey, formData: LockFormData): Promise<string> {
    const [vaultPDA, bump] = await this.getVaultAddress(authority)

    try {
      // If vault exists, skip initialization
      try {
        await this.program.account.vault.fetch(vaultPDA)
        console.log("Vault already initialized. Skipping initialize.")
        return "Vault already exists"
      } catch {
        // if not found, create new
      }

      const recipient = new PublicKey(formData.recipientAddress)
      const cancelPermission = this.permissionTypeToU8(formData.cancelPermission)
      const changeRecipientPermission = this.permissionTypeToU8(formData.changeRecipientPermission)
      const lockDuration = new BN(formData.lockDuration)  // user-specified lock duration (seconds)

      const txSig = await this.program.methods
        .initialize(recipient, cancelPermission, changeRecipientPermission, lockDuration)
        .accounts({
          vault: vaultPDA,
          authority,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log("Vault initialized ✅", txSig)
      return txSig
    } catch (err) {
      console.error("Error initializing vault:", err)
      throw err
    }
  }

  async deposit(authority: PublicKey, amountSol: number): Promise<string> {
    const [vaultPDA] = await this.getVaultAddress(authority)
    const amountLamports = Math.floor(web3.LAMPORTS_PER_SOL * amountSol)

    try {
      const txSig = await this.program.methods
        .deposit(new BN(amountLamports))
        .accounts({
          vault: vaultPDA,
          user: authority,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log("Deposit successful ✅", txSig)
      return txSig
    } catch (err) {
      console.error("Error depositing to vault:", err)
      throw err
    }
  }

  async getVaultInfo(authority: PublicKey) {
    const [vaultPDA] = await this.getVaultAddress(authority)

    const accountInfo = await this.provider.connection.getAccountInfo(vaultPDA)
    if (!accountInfo) {
      console.log("Vault account not initialized yet.")
      return null
    }
    try {
      const vaultAccount = (await this.program.account.vault.fetch(vaultPDA)) as any
      const balanceLamports = accountInfo.lamports ?? 0

      return {
        vaultAddress: vaultPDA,
        balanceLamports: balanceLamports,
        authority: vaultAccount.authority as PublicKey,
        recipient: vaultAccount.recipient as PublicKey,
        cancelPermission: vaultAccount.cancelPermission as number,
        changeRecipientPermission: vaultAccount.changeRecipientPermission as number,
     
      }
    } catch (err) {
      console.error("Error fetching vault info:", err)
      return null
    }
  }

  permissionTypeToU8(permission: PermissionType): number {
    switch (permission) {
      case PermissionType.NONE:
        return 0
      case PermissionType.RECIPIENT:
        return 1
      case PermissionType.CREATOR:
        return 2
      case PermissionType.BOTH:
        return 3
      default:
        return 0
    }
  }
}
