# @absolutejs/onchain-adapters

Real-chain adapters for [`@absolutejs/onchain`](../onchain). The core ships a **local**
adapter (in-memory/file, zero setup) for dev and fully off-chain play; this monorepo holds
the production providers.

| Adapter | Package | Status |
|---|---|---|
| **Base (L2)** | `@absolutejs/onchain-base` | scaffold — GitHub fact-verification implemented; gasless soulbound mint + VRF wired to config |

Recommended Base stack (from research): Coinbase Smart Wallet / Privy (embedded wallet),
ERC-721 **soulbound** (ERC-5484) with on-chain `seed` (tokenURI re-derives the art), gasless
via **ERC-4337 + paymaster**, **Chainlink VRF** for the genuine 1-of-1 rolls.

## Add an adapter

1. New workspace dir (e.g. `thirdweb/`), add it to root `workspaces`.
2. `package.json`: name `@absolutejs/onchain-<provider>`, depend on `@absolutejs/onchain`.
3. Implement the `@absolutejs/onchain/adapter-kit` contract and export a
   `createXAdapter(config): OnchainAdapters`.
