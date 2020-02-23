// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

import { Enum, Option, Struct } from '@polkadot/types/codec';
import { Bytes, Text, u32 } from '@polkadot/types/primitive';
import { AccountId } from '@polkadot/types/interfaces/runtime';

/** @name Attestation */
export interface Attestation extends Bytes {}

/** @name Identity */
export interface Identity extends Bytes {}

/** @name IdentityRecord */
export interface IdentityRecord extends Struct {
  readonly account: AccountId;
  readonly identity_type: Text;
  readonly identity: Bytes;
  readonly stage: IdentityStage;
  readonly expiration_time: u32;
  readonly proof: Option<Text>;
  readonly metadata: Option<MetadataRecord>;
}

/** @name IdentityStage */
export interface IdentityStage extends Enum {
  readonly isRegistered: boolean;
  readonly isAttested: boolean;
  readonly isVerified: boolean;
}

/** @name IdentityType */
export interface IdentityType extends Text {}

/** @name MetadataRecord */
export interface MetadataRecord extends Struct {
  readonly avatar: Text;
  readonly display_name: Text;
  readonly tagline: Text;
}
