'use client';

import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { useAuthAndProfile } from '@/lib/auth-helpers';

export default function Header() {
  const { user, profile, isLoading } = useAuthAndProfile();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-orange-600">
              Blab
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Posts
              </Link>
              <Link href="/leaderboard" className="text-gray-700 hover:text-gray-900">
                Leaderboard
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(profile?.balance || 0)}
                </span>
                <Link 
                  href={`/user/${profile?.id || user.id}`}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {profile?.handle || user.email}
                </Link>
                <button
                  onClick={() => db.auth.signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const email = prompt('Enter your email:');
                    if (email) {
                      db.auth.sendMagicCode({ email });
                      alert('Check your email for the login code!');
                    }
                  }}
                  className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}