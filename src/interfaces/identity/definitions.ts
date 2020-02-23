// This is free and unencumbered software released into the public domain.

export default {
  types: {
    MetadataRecord: {
      avatar: 'Text',
      display_name: 'Text',
      tagline: 'Text'
    },
    IdentityStage: {
      _enum: ['Registered', 'Attested', 'Verified']
    },
    IdentityRecord: {
      account: 'AccountId',
      identity_type: 'Text',
      identity: 'Vec<u8>',
      stage: 'IdentityStage',
      expiration_time: 'u32',
      proof: 'Option<Text>',
      metadata: 'Option<MetadataRecord>'
    },
    IdentityType: 'Text',
    Attestation: 'Vec<u8>',
    Identity: 'Vec<u8>'
  }
}
