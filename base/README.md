# @absolutejs/onchain-base

Base (L2) adapter for [`@absolutejs/onchain`](https://github.com/absolutejs/onchain):
gasless, soulbound, seed-is-asset minting with un-forgeable, GitHub-verified
attestations.

```bash
bun add @absolutejs/onchain-base @absolutejs/onchain
```

```ts
import { createOnchain } from '@absolutejs/onchain';
import { baseAdapter } from '@absolutejs/onchain-base';

const onchain = createOnchain({ adapter: baseAdapter({ /* … */ }) });
```

See the [`@absolutejs/onchain` docs](https://github.com/absolutejs/onchain) for
the full provider-agnostic API. Part of
[`@absolutejs/onchain-adapters`](https://github.com/absolutejs/onchain-adapters).
