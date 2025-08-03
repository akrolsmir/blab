import { i } from '@instantdb/react'

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    profiles: i.entity({
      handle: i.string(),
      bio: i.string().optional(),
      balance: i.number().optional(),
    }),
    posts: i.entity({
      title: i.string(),
      content: i.string(),
      createdAt: i.number().indexed(),
      upvotes: i.number().optional(),
      downvotes: i.number().optional(),
    }),
    txns: i.entity({
      amount: i.number(),
      type: i.string(),
      description: i.string(),
      createdAt: i.number().indexed(),
      completedAt: i.number().optional(),
    }),
  },
  links: {
    userProfiles: {
      forward: { on: 'profiles', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
    postAuthors: {
      forward: { on: 'posts', has: 'one', label: 'author', required: true },
      reverse: { on: 'profiles', has: 'many', label: 'posts' },
    },
    txnFrom: {
      forward: { on: 'txns', has: 'one', label: 'fromUser', required: true },
      reverse: { on: 'profiles', has: 'many', label: 'sentTxns' },
    },
    txnTo: {
      forward: { on: 'txns', has: 'one', label: 'toUser', required: true },
      reverse: { on: 'profiles', has: 'many', label: 'receivedTxns' },
    },
    txnPost: {
      forward: { on: 'txns', has: 'one', label: 'post' },
      reverse: { on: 'posts', has: 'many', label: 'txns' },
    },
  },
})

type _AppSchema = typeof _schema
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema
