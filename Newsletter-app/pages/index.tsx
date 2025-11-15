import { useState, useEffect, useRef } from 'react';
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
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
  tags: string[];
}

export default function Home({ user, logout }: any) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchPosts();
      hasFetchedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?published=true&limit=12', {
        cache: 'default', // Allow browser caching
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Successfully subscribed to newsletter!');
        setNewsletterEmail('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to subscribe. Please try again.');
    }
  };

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Discover stories, thinking, and expertise
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Where good ideas find you.
          </p>
          {!user && (
            <Link
              href="/register"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-primary-700 transition"
            >
              Get started
            </Link>
          )}
        </div>

        {/* Write a Post Section for Admin */}
        {user && user.role === 'admin' && (
          <div className="mb-16 p-8 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Share your thoughts</h2>
            <p className="text-gray-600 mb-6">Write a new post and share your ideas.</p>
            <Link
              href="/write"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Write a Post
            </Link>
          </div>
        )}

        {/* Featured Posts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Stories</h2>
              <p className="text-lg text-gray-600">Explore the most compelling reads</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/posts/${post.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {post.coverImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      {post.author.image && (
                        <Image
                          src={post.author.image}
                          alt={post.author.name}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                      )}
                      <span>{post.author.name}</span>
                    </div>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            </div>
          </>
        ) : (
          <></>
        )}

        {/* Newsletter Section */}
        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to the newsletter</h2>
          <p className="text-gray-600 mb-6">Get the latest stories and updates delivered to your inbox.</p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

