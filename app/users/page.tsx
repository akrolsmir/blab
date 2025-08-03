// Show all users and their associated transactions
'use client'

import Schema from '@/instant.schema'
import { db } from '@/lib/db'
import { TxnWithLinks } from '@/lib/types'
import { id } from '@instantdb/react'

function TxnList({ txns }: { txns: TxnWithLinks[] }) {
  return (
    <div>
      {txns.map((txn) => (
        <div key={txn.id}>
          {txn.amount} from {txn.fromUser?.handle} to {txn.toUser?.handle} on{' '}
          {new Date(txn.createdAt).toLocaleString()}
        </div>
      ))}
    </div>
  )
}

export default function UsersPage() {
  async function createTxn(props: {
    amount: number
    fromUser: string
    toUser: string
  }) {
    const { amount, fromUser, toUser } = props

    await db.transact(
      db.tx.txns[id()]
        .create({
          amount: Number(amount),
          type: 'transfer',
          description: `Transfer from ${fromUser} to ${toUser}`,
          status: 'pending',
          createdAt: Date.now(),
        })
        .link({ fromUser, toUser })
    )
  }

  const { data } = db.useQuery({
    profiles: {
      sentTxns: {},
      receivedTxns: {},
    },
  })

  const { data: allTxns } = db.useQuery({
    txns: {
      fromUser: {},
      toUser: {},
    },
  })

  const { user } = db.useAuth()
  const userId = user?.id

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      {data?.profiles.map((profile) => (
        <div className="p-4 flex gap-4" key={profile.id}>
          <div key={profile.id}>
            <h2>{profile.handle}</h2>
            <p>{profile.bio}</p>
            {/* Calculate balance based on sent and received txns */}
            <p>
              Balance:{' '}
              {profile.sentTxns.reduce((acc, txn) => acc + txn.amount, 0) -
                profile.receivedTxns.reduce((acc, txn) => acc + txn.amount, 0)}
            </p>
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            onClick={() =>
              createTxn({
                amount: 100,
                fromUser: userId!,
                toUser: profile.id,
              })
            }
          >
            Send 100
          </button>
        </div>
      ))}

      <h1 className="text-2xl font-bold">All Transactions</h1>
      <TxnList txns={allTxns?.txns ?? []} />
    </div>
  )
}
