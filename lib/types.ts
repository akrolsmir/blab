import { InstaQLEntity } from '@instantdb/react'
import Schema from '../instant.schema'

export type Txn = InstaQLEntity<typeof Schema, 'txns'>
export type TxnWithLinks = InstaQLEntity<
  typeof Schema,
  'txns',
  { fromUser: {}; toUser: {} }
>
