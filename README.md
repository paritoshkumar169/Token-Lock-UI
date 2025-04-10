# 🔐 Token Lock UI (Solana Devnet)

Live Demo 👉 [https://v0-solana-ubsvcq.vercel.app](https://v0-solana-ubsvcq.vercel.app)  
🎥 Demo Video: [`app/demo.mp4`](app/demo.mp4)

A simple UI built to interact with a Solana smart contract that locks SOL for a specified duration. You can create, view, and unlock vaults — built on **Solana Devnet**.

---

## 🛠️ Getting Started

```bash
git clone https://github.com/paritoshkumar169/Token-Lock-UI
cd Token-Lock-UI
npm install
npm run dev
💡 Make sure your wallet is set to Devnet and airdrop some SOL using: solana airdrop 2 <your_wallet_address>


## ⚙️ Built With

This project uses the following technologies:

- **Next.js 15** – React framework for server-side rendering and routing  
- **Tailwind CSS** – Utility-first CSS framework for styling  
- **Solana Web3.js** – Official Solana JavaScript SDK for blockchain interaction  
- **Anchor** – Rust framework for writing Solana smart contracts with easier client integration

---

## 🔄 Future Improvements

Some ideas for extending the functionality:

- 🔐 Add **ownership control** so only vault creators can cancel or modify token locks  
- 🪙 Support **SPL token locking**, not just native SOL  
- 🧾 Add **activity logs and transaction history** to improve transparency and tracking
