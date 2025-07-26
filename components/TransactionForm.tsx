'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { useAuthAndProfile } from '@/lib/auth-helpers';
import { formatCurrency } from '@/lib/utils';
import { id } from '@instantdb/react';

interface TransactionFormProps {
  postId?: string;
  postAuthorId?: string;
  onClose: () => void;
}

export default function TransactionForm({ postId, postAuthorId, onClose }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'bet' | 'bounty' | 'investment'>('bet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, profile } = useAuthAndProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim() || !user || !profile || !postAuthorId) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amountNum > (profile.balance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.transact([
        // Create transaction
        db.tx.txns[id()]
          .update({
            amount: amountNum,
            type,
            description: description.trim(),
            status: 'pending',
            createdAt: Date.now(),
          })
          .link({ 
            fromUser: profile.id,
            toUser: postAuthorId,
            ...(postId && { post: postId })
          }),
        // Update sender balance
        db.tx.profiles[profile.id].update({
          balance: (profile.balance || 0) - amountNum
        })
      ]);
      
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="flex space-x-4">
          {[
            { value: 'bet', label: 'Place Bet', desc: 'Wager on outcome' },
            { value: 'bounty', label: 'Offer Bounty', desc: 'Pay for task completion' },
            { value: 'investment', label: 'Invest', desc: 'Support this project' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                value={option.value}
                checked={type === option.value}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="mr-2"
              />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount ({formatCurrency(profile?.balance || 0)} available)
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="0.00"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Describe your transaction..."
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !amount || !description.trim()}
        >
          {isSubmitting ? 'Processing...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </button>
      </div>
    </form>
  );
}