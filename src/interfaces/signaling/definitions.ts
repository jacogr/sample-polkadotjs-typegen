// This is free and unencumbered software released into the public domain.

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
