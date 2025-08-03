'use client'

import { db } from '@/lib/db'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function UserProfile({ params }: PageProps) {
  const { id } = use(params)

  const { data, isLoading, error } = db.useQuery({
    profiles: {
      $: {
        where: {
          id,
        },
      },
      posts: {},
      sentTxns: {},
      receivedTxns: {},
    },
  })

  if (isLoading)
    return <div className="max-w-4xl mx-auto p-6">Loading user profile...</div>
  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-600">
        Error: {error.message}
      </div>
    )

  const profile = data?.profiles?.[0]
  const posts = profile?.posts || []
  const sentTxns = profile?.sentTxns || []
  const receivedTxns = profile?.receivedTxns || []
  const transactions = [...sentTxns, ...receivedTxns].sort(
    (a, b) => b.createdAt - a.createdAt
  )

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-gray-500">User not found</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.handle}
            </h1>
            {profile.bio && <p className="text-gray-600 mb-4">{profile.bio}</p>}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="text-green-600 font-medium">
                Balance: {formatCurrency(profile.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Posts ({posts.length})
          </h2>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No posts yet</div>
            ) : (
              posts.map((post: any) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    <Link
                      href={`/post/${post.id}`}
                      className="hover:text-orange-600"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <div className="flex items-center space-x-2">
                      <span>▲ {post.upvotes || 0}</span>
                      <span>▼ {post.downvotes || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transactions ({transactions.length})
          </h2>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No transactions yet
              </div>
            ) : (
              transactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        txn.type === 'bet'
                          ? 'bg-orange-100 text-orange-700'
                          : txn.type === 'investment'
                            ? 'bg-blue-100 text-blue-700'
                            : txn.type === 'bounty'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {txn.type}
                    </span>
                    <span
                      className={`font-medium ${
                        sentTxns.includes(txn)
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {sentTxns.includes(txn) ? '-' : '+'}
                      {formatCurrency(txn.amount)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    {txn.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(txn.createdAt)}</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        txn.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : txn.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
