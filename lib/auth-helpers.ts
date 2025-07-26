import { db } from './db';

function randomHandle() {
  const adjectives = ['Quick', 'Lazy', 'Happy', 'Bright', 'Smart', 'Cool'];
  const nouns = ['Fox', 'Dog', 'Cat', 'Bird', 'Fish', 'Wolf'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `${randomAdjective}${randomNoun}${randomSuffix}`;
}

export async function ensureUserProfile(userId: string) {
  try {
    await db.transact(
      db.tx.profiles[userId]
        .update({
          handle: randomHandle(),
          balance: 1000, // Starting balance
        })
        .link({ user: userId })
    );
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

export function useAuthAndProfile() {
  const { user } = db.useAuth();
  
  const { data, isLoading } = db.useQuery(
    user ? {
      profiles: {
        $: {
          where: {
            'user.id': user.id
          }
        }
      }
    } : {}
  );
  
  const profile = data?.profiles?.[0];
  
  // Auto-create profile if user exists but no profile
  if (user && !isLoading && !profile) {
    ensureUserProfile(user.id);
  }
  
  return { user, profile, isLoading };
}