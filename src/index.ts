// This is free and unencumbered software released into the public domain.

// all type stuff
import type { VoteData } from './interfaces';

// external imports
import { ApiPromise } from '@polkadot/api';

// our local stuff
import * as defintions from './interfaces/definitions';

// extract all types from definitions - fast an dirty approach
const myTypes = Object.values(defintions).reduce((res, { types }): object => ({ ...res, ...types }), {});

async function main (): Promise<void> {
  const api = await ApiPromise.create({
    types: {
      ...myTypes,
      // aliasses that don't do well as part of interfaces
      'voting::VoteType': 'VoteType',
      'voting::TallyType': 'TallyType',
      // chain-specific overrides
      Keys: 'SessionKeys4'
    }
  });
}

await main();
