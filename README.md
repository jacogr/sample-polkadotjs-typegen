# sample-polkadotjs-typegen

This is a sample TypeScript using `@polkadot/typegen` to generate type definitions. It uses both types defined for the specific chain as well as the chain metadata to generate types that the API is decorated with.

**NOTE** This is built using the latest updates in the `1.4.0` api track, and as such it uses the latest (at the time of writing) api 1.4.0-beta. If you want to play on your own, it is also suggested that you use the beta (some generation types have moved around internally). The 1.4 release is a couple of days away. (At which point these docs will also be included in the API getting started itself as an example)

## Packages

For the packages we need from the `@polkadot/*` toolset, we have added `@polkdot/api` (we want to do API stuff) and `@polkadot/typegen` (to generate the actual interfaces). So our scripts and dependencies contain the following -

```json
{
  "scripts": {
    "build": "yarn generate:defs && yarn generate:meta",
    "generate:defs": "ts-node --skip-project node_modules/.bin/polkadot-types-from-defs --package sample-polkadotjs-typegen/interfaces --input ./src/interfaces",
    "generate:meta": "ts-node --skip-project node_modules/.bin/polkadot-types-from-chain --package sample-polkadotjs-typegen/interfaces --endpoint ./metadata.json --output ./src/interfaces",
    "lint": "tsc --noEmit --pretty"
  },
  "dependencies": {
    "@polkadot/api": "1.4.0-beta.36"
  },
  "devDependencies": {
    "@polkadot/typegen": "1.4.0-beta.36",
    "ts-node": "^8.6.2",
    "typescript": "^3.8.2"
  }
}
```

We will delve into the setup and running the scripts (and what they do in a short bit), but as of now just notice that we are running the scripts via `ts-node`. Since we supply our definitions as `*.ts` files, this is important otherwise they will not be parseable. `build` will just run both the types and meta generators (in that order, so metadata can use the types) and we have a `lint` that can just check that everything is as it is meant to be.

## Metadata setup

The idea here is to use the actual chain metadata to generate the actual api augmented endpoints. The metadata we are adding here (in addition to the user types), is from the Edgeware Berlin testnet. So this is a rea-world example of configuring the API for a specific substrate chain. For the metadata retrieval, we just ran a simple curl command to retrieve the metadata -

` curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' http://localhost:9933`

And then add the full JSONPC output as received to the `metadata.json` file. A trimmed version would look like -

```json
{"jsonrpc":"2.0","result":"0x6d6574610b6c185379737....","id":29}
```

The generator can also use a `wss://` endpoint as part of the generation, but in most cases you would want a static metadata to work from in development, hence actually adding it here.

## Types setup

The types are defined in the `src/interfaces` folder. While this repo contains a number of generated files in there as wll, you basically only need -

- `src/interfaces/definitions.ts` - this just exports all the sub-folder definitions in one go
- `src/interfaces/<module>/definitions.ts` - type definitions for a specific module

This structure fully matches what is available in the `@polkadot/type/interfaces` folder, so the structure is setup based on convention. The generating scripts will expect a structure matching this. The top-level `interfaces/` folder can be anything, however the content structure need to match.

For the top-level, defintion files, it basically contains -

```js
export { default as signaling } from './signaling/definitions';
export { default as treauryRewards } from './treauryRewards/definitions';
export { default as voting } from './voting/definitions';
```

As explained above, it really is just a re-export of the definitions, so ther are all easily accessible. The generation scripts don't use this specific file, but once-again, convention.

For each of the folders, `signaling`, `treasuyRewards` and `voting` another `definitions.ts` file is contained within. Looking at the one from `signaling`, it contains this -

```js
export default {
  types: {
    ProposalRecord: {
      index: 'u32',
      author: 'AccountId',
      stage: 'VoteStage',
      transition_time: 'u32',
      title: 'Text',
      contents: 'Text',
      vote_id: 'u64'
    },
    ProposalContents: 'Vec<u8>',
    ProposalTitle: 'Vec<u8>'
  }
}
```

Just the type definitions (which you should be familiar with), nsted inside a `types`. (This allows extension points, i.e. there is some work to expose the custome RPC types alongside, so that would become another key on a per-module basis) Looking at the example here, as it stands, it also have `augment*` and `index.ts` as well as `types.ts` files in the interfaces folder. These are all generated. The only requirement for user-edits are the `definitions.ts` files.

## Generating

Now that both the metadata nd types setup is completed, just run the build command via `yarn build` - magically (assuming you didn't have the `augment*` and other generated files), these files will be added. Output from running this command, would look a bit like -

```
> yarn build && yarn lint
yarn run v1.22.0
$ yarn generate:defs && yarn generate:meta
$ ts-node --skip-project node_modules/.bin/polkadot-types-from-defs \
  --package sample-polkadotjs-typegen/interfaces \
  --input ./src/interfaces

sample-polkadotjs-typegen/src/interfaces/types.ts
	Generating
	Extracting interfaces for signaling
	Extracting interfaces for treauryRewards
	Extracting interfaces for voting
	Writing

sample-polkadotjs-typegen/src/interfaces/augment-types.ts
	Generating
	Writing

$ ts-node --skip-project node_modules/.bin/polkadot-types-from-chain \
  --package sample-polkadotjs-typegen/interfaces \
  --endpoint ./metadata.json \
  --output ./src/interfaces

Generating from metadata, 81,267 bytes
sample-polkadotjs-typegen/src/interfaces/augment-api-consts.ts
	Generating
	Writing

sample-polkadotjs-typegen/src/interfaces/augment-api-query.ts
	Generating
	Writing

sample-polkadotjs-typegen/src/interfaces/augment-api-tx.ts
	Generating
	Writing

sample-polkadotjs-typegen/src/interfaces/augment-api.ts
	Generating
	Writing

✨  Done in 4.04s.
yarn run v1.22.0
$ tsc --noEmit --pretty
✨  Done in 2.28s.
>
```

And that is it. We are ready to use this after some TS config.

## TypeScript config

Now that we have files generated, it is time to make TypeScript aware of the types and add an explicit override into out `tsconfig.json`. After some changes, the paths in the config looks as follow (comments are in teh actual config file here) -

```json
{
  "compilerOptions": {
    "paths": {
      "sample-polkadotjs-typegen/*": ["src/*"],
      "@polkadot/api/augment": ["src/interfaces/augment-api.ts"],
      "@polkadot/types/augment": ["src/interfaces/augment-types.ts"]
    }
  }
}
```

Effectively what we do above is tell the TypeScript compiler to not use the built-in API augmentation, but rather to replace it with our version. This means that all types from these are injected not by the substrate-latest-master version, but rather with what we have defined abve.

## Usage

For simple usage, we have added the `src/index.ts` file that show how the metadata and types actually decorate the API. In addition, we also have setup instructions included here.

```js
// We need to import the augmented definitions "somewhere" in our project, however since we have
// it in tsconfig as an override and the api/types has imports, it is not strictly required here.
// Because of the tsconfig override, we could import from '@polkadot/{api, types}/augment'
import './interfaces/augment-api';
import './interfaces/augment-types';

// all type stuff, the only one we are using here
import type { VoteRecord } from './interfaces';

// external imports
import { ApiPromise } from '@polkadot/api';
import { createType } from '@polkadot/types';

// our local stuff
import * as defintions from './interfaces/definitions';

async function main (): Promise<void> {
  // extract all types from definitions - fast and dirty approach, flatted on 'types'
  const types = Object.values(defintions).reduce((res, { types }): object => ({ ...res, ...types }), {});

  const api = await ApiPromise.create({
    types: {
      ...types,
      // aliasses that don't do well as part of interfaces
      'voting::VoteType': 'VoteType',
      'voting::TallyType': 'TallyType',
      // chain-specific overrides
      Keys: 'SessionKeys4'
    }
  });

  // get a query
  const recordOpt = await api.query.voting.voteRecords(123);

  // the types match with what we expect here
  let firstRecord: VoteRecord | null = recordOpt.unwrapOr(null);
  console.log(firstRecord?.toHuman());

  // it even does work for arrays & subscriptions
  api.query.signaling.activeProposals((results): void => {
    results.forEach(([hash, blockNumber]): void => {
      console.log(hash.toHex(), ':', blockNumber.toNumber());
    });
  });

  // even createType works, allowing for our types to be used
  console.log(`Balance2 bitLength:`, [
    api.createType('Balance2').bitLength(),
    api.registry.createType('Balance2').bitLength(),
    createType(api.registry, 'Balance2').bitLength()
  ]);
}

await main();
```

## ... and that is a ...

... wrap. Just a really simple walk-through to customizing the API TypeScript definitions for your chain.
