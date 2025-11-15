import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  published: boolean;
}

export default function Profile({ user, logout }: any) {
  const router = useRouter();
  const { id } = router.query;
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const hasFetchedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (id && hasFetchedRef.current !== id) {
      hasFetchedRef.current = id as string;
      setLoading(true);
      setProfileUser(null);
      setPosts([]);
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user && profileUser) {
      setIsOwnProfile(user.id === id);
    }
  }, [user, profileUser, id]);

  const fetchProfile = async () => {
    try {
      // Fetch profile user data first
      const userRes = await fetch(`/api/user?id=${id}`);
      let fetchedUser = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success) fetchedUser = userData.user;
      }
      setProfileUser(fetchedUser);

      // Fetch posts as before
      const res = await fetch('/api/posts?published=true&limit=100', {
        cache: 'default',
      });
      const data = await res.json();

      if (data.success) {
        const userPosts = data.posts.filter((post: any) => post.author._id === id);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} logout={logout}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileUser && !(user && user.id === id)) {
    return (
      <Layout user={user} logout={logout}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Profile not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-4 mb-4">
              {(profileUser?.image) ? (
                <Image
                  src={profileUser.image}
                  alt={profileUser?.name || 'Avatar'}
                  width={72}
                  height={72}
                  className="rounded-full border-2 border-primary-600"
                />
              ) : (
                <Image
                  src={
                    profileUser?.role === 'admin' ? '/avatars/cat.png' :
                    profileUser?.role === 'user' ? '/avatars/dog.png' :
                    '/avatars/default.png'
                  }
                  alt="Default avatar"
                  width={72}
                  height={72}
                  className="rounded-full border-2 border-primary-600 bg-gray-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{profileUser?.name || 'Your Name'}</h1>
                {profileUser?.role && (
                  <p className="text-sm text-primary-600 font-semibold mb-1">{profileUser.role}</p>
                )}
                {(profileUser?.role !== 'user' || posts.length > 0) && (
                  <p className="text-gray-500 text-xs">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
                )}
              </div>
            </div>
            {profileUser?.bio && (
              <p className="text-gray-600 mb-4">{profileUser.bio}</p>
            )}
          </div>
        </div>

        {profileUser?.role !== 'user' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {isOwnProfile ? 'Your Posts' : 'Posts'}
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/posts/${post.slug}`}
                    className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="flex">
                      {post.coverImage && (
                        <div className="relative w-48 h-32 flex-shrink-0">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                          
                          {!post.published && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No posts yet</p>
                {isOwnProfile && profileUser?.role !== 'user' && (
                  <Link
                    href="/write"
                    className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Write your first post
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

