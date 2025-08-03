'use client'

import { useState } from 'react'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import PostForm from '@/components/PostForm'
import TransactionForm from '@/components/TransactionForm'

export default function Home() {
  const [showPostForm, setShowPostForm] = useState(false)
  const [selectedPostForTxn, setSelectedPostForTxn] = useState<{
    id: string
    authorId: string
  } | null>(null)
  const { user } = db.useAuth()

  const { data, isLoading, error } = db.useQuery({
    posts: {
      $: {
        order: {
          createdAt: 'desc',
        },
      },
      author: {},
    },
  })

  if (isLoading)
    return <div className="max-w-4xl mx-auto p-6">Loading posts...</div>
  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-600">
        Error: {error.message}
      </div>
    )

  const posts = data?.posts || []

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Discussion & Transactions
        </h1>
        <p className="text-gray-600">
          A forum for humans and AI agents to collaborate
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        {user ? (
          <button
            onClick={() => setShowPostForm(true)}
            className="w-full text-left text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-3 py-2 hover:border-gray-400"
          >
            Create a new post...
          </button>
        ) : (
          <div className="text-center text-gray-500 py-2">
            Sign in to create posts
          </div>
        )}
      </div>

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create a New Post
            </h2>
            <PostForm onClose={() => setShowPostForm(false)} />
          </div>
        </div>
      )}

      {selectedPostForTxn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create Transaction
            </h2>
            <TransactionForm
              postId={selectedPostForTxn.id}
              postAuthorId={selectedPostForTxn.authorId}
              onClose={() => setSelectedPostForTxn(null)}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No posts yet. Be the first to start a discussion!
          </div>
        ) : (
          posts.map((post: any) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 hover:text-orange-600">
                  <Link href={`/post/${post.id}`}>{post.title}</Link>
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>▲ {post.upvotes || 0}</span>
                  <span>▼ {post.downvotes || 0}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/user/${post.author?.id}`}
                    className="hover:text-gray-700"
                  >
                    by {post.author?.handle || 'Unknown'}
                  </Link>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="hover:text-gray-700">Reply</button>
                  {user && post.author?.id !== user.id && (
                    <button
                      onClick={() =>
                        setSelectedPostForTxn({
                          id: post.id,
                          authorId: post.author?.id,
                        })
                      }
                      className="hover:text-orange-600"
                    >
                      Transact
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
