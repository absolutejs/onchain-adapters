// @absolutejs/onchain-base — the real-chain adapter (Base L2). Scaffold: the un-forgeable
// integrity gate (verify `fact` against GitHub before signing) is implemented for real;
// the on-chain pieces (embedded wallet, gasless soulbound mint, VRF) are wired to config
// and throw a clear "configure …" until you supply RPC/keys/contract. Filling those in is
// the production step — the contract is intentionally NOT deployed here (real keys/funds).
//
// Recommended production wiring (from research):
//  - wallet:   Coinbase Smart Wallet / Privy embedded wallet (no seed phrase)
//  - mint:     ERC-721 soulbound (ERC-5484) on Base, gasless via ERC-4337 + paymaster,
//              tokenURI re-derives art from the on-chain `seed` ("the seed is the asset")
//  - random:   Chainlink VRF for the genuine 1-of-1 rolls
import type { Attestation, Attester, MintProvider, OnchainAdapters, RandomnessProvider, WalletProvider } from "@absolutejs/onchain/adapter-kit";

export type BaseConfig = {
  rpcUrl?: string;
  contract?: string;      // soulbound ERC-721 address
  attesterPrivateKey?: string;
  paymasterUrl?: string;
  githubToken?: string;   // optional, raises rate limits / allows private-repo facts
};

const need = (what: string): never => { throw new Error(`onchain-base: ${what} not configured — supply BaseConfig to enable on-chain minting (or use the local adapter for dev).`); };

// THE anti-fake gate: a fact "github:commit:<owner>/<repo>@<sha>" is only attestable if
// that commit actually exists on GitHub. No real commit ⇒ no attestation ⇒ no token —
// which the app operator cannot bypass without the commit genuinely existing.
const verifyGithubFact = async (fact: string, cfg: BaseConfig): Promise<boolean> => {
  const m = fact.match(/^github:commit:([^/]+)\/([^@]+)@([0-9a-f]{7,40})$/i);
  if (!m) return false;
  const [, owner, repo, sha] = m;
  const headers: Record<string, string> = { accept: "application/vnd.github+json" };
  if (cfg.githubToken) headers.authorization = `Bearer ${cfg.githubToken}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, { headers, signal: AbortSignal.timeout(8000) });
    return res.ok;   // (production: also assert the commit author == the claiming identity)
  } catch { return false; }
};

export const baseAdapter = (cfg: BaseConfig = {}): OnchainAdapters => {
  const wallet: WalletProvider = {
    id: "base",
    ensureWallet: async () => need("embedded wallet provider (Coinbase Smart Wallet / Privy)"),
    addressFor: async () => null
  };
  const attester: Attester = {
    id: "base",
    attest: async (input) => {
      if (!(await verifyGithubFact(input.fact, cfg))) throw new Error("onchain-base: fact could not be verified against GitHub — refusing to attest");
      return need("attester signer key (sign the verified attestation)") as unknown as Attestation;
    },
    verify: async () => need("on-chain attestation verification")
  };
  const mint: MintProvider = {
    id: "base",
    mint: async () => need("gasless soulbound mint (ERC-4337 paymaster + ERC-5484 contract)"),
    ownerOf: async () => need("contract read"),
    isSeedUsed: async () => need("contract read (usedSeed mapping)"),
    ownedBy: async () => need("contract/indexer read")
  };
  const randomness: RandomnessProvider = {
    id: "base",
    random: async () => need("Chainlink VRF")
  };
  return { wallet, attester, mint, randomness };
};
