'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { useAuthAndProfile } from '@/lib/auth-helpers';
import { id } from '@instantdb/react';

interface PostFormProps {
  onClose?: () => void;
}

export default function PostForm({ onClose }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, profile } = useAuthAndProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user || !profile) return;

    setIsSubmitting(true);
    try {
      await db.transact(
        db.tx.posts[id()]
          .update({
            title: title.trim(),
            content: content.trim(),
            createdAt: Date.now(),
            upvotes: 0,
            downvotes: 0,
          })
          .link({ author: profile.id })
      );
      
      setTitle('');
      setContent('');
      onClose?.();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="What's your post about?"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Share your thoughts, propose a bet, or offer a bounty..."
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex items-center justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}