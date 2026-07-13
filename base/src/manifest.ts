import { defineImplementation, defineManifest } from "@absolutejs/manifest";
import { Type } from "@sinclair/typebox";
import type { BaseConfig } from "./index";

/* BaseConfig is credentials + endpoints (rpcUrl, attesterPrivateKey,
 * paymasterUrl, githubToken) plus the contract address. The secrets come from
 * env at wiring time; only the contract address is a serializable setting. */
export const manifest = defineManifest<BaseConfig>()({
  contract: 1,
  identity: {
    accent: "#0052ff",
    category: "web3",
    description:
      "Base (L2) adapter for `@absolutejs/onchain`. Implements the un-forgeable attestation gate for real — a `github:commit:owner/repo@sha` fact is verified against GitHub before anything is signed. The on-chain pieces (embedded wallet, gasless ERC-4337 + paymaster soulbound mint, Chainlink VRF) are wired to config and fail with a clear message until you supply RPC, keys, and the contract address.",
    docsUrl: "https://github.com/absolutejs/onchain-adapters/tree/main/base",
    name: "@absolutejs/onchain-base",
    tagline: "Put your players' earned collectibles on Base, gas-free.",
  },
  implements: [
    defineImplementation<BaseConfig>()({
      contract: "onchain/adapters",
      factory: "baseAdapter",
      from: "@absolutejs/onchain-base",
      requires: {
        env: [
          {
            description:
              "Base RPC endpoint URL (from your node provider — often embeds an API key)",
            docsUrl: "https://docs.base.org/",
            example: "https://base-mainnet.g.alchemy.com/v2/xxxx",
            key: "BASE_RPC_URL",
            secret: true,
          },
          {
            description:
              "Private key of the trusted attester — signs attestations after the fact is verified",
            example: "0xabc123...64-hex-chars",
            key: "ONCHAIN_ATTESTER_PRIVATE_KEY",
            secret: true,
          },
          {
            description:
              "ERC-4337 paymaster endpoint that sponsors gas so users mint for free",
            docsUrl: "https://docs.cdp.coinbase.com/paymaster/docs/welcome",
            example: "https://api.developer.coinbase.com/rpc/v1/base/xxxx",
            key: "BASE_PAYMASTER_URL",
            optional: true,
            secret: true,
          },
          {
            description:
              "GitHub token used when verifying commit facts — raises rate limits and allows private-repo facts",
            docsUrl: "https://github.com/settings/tokens",
            example: "ghp_xxxxxxxxx",
            key: "GITHUB_TOKEN",
            optional: true,
            secret: true,
          },
        ],
      },
      settings: Type.Object({
        contract: Type.Optional(
          Type.String({
            description:
              "Address of your soulbound ERC-721 collectible contract on Base.",
            examples: ["0x0000000000000000000000000000000000000000"],
            title: "Collectible contract address",
          }),
        ),
      }),
      title: "Base (L2)",
      wiring: {
        code: "baseAdapter({ attesterPrivateKey: ${env.ONCHAIN_ATTESTER_PRIVATE_KEY}, githubToken: ${env.GITHUB_TOKEN}, paymasterUrl: ${env.BASE_PAYMASTER_URL}, rpcUrl: ${env.BASE_RPC_URL}, ...${settings} })",
        imports: [
          { from: "@absolutejs/onchain-base", names: ["baseAdapter"] },
        ],
      },
    }),
  ],
  settings: Type.Object({}),
  wiring: [],
});
