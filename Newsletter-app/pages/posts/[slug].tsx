import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { calculateReadingTime } from '@/lib/readingTime';

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  tags: string[];
  published: boolean;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
}

export default function PostPage({ user, logout }: any) {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
      if (post) {
        setUserLiked(post.likes?.includes(user.id) || false);
        setUserDisliked(post.dislikes?.includes(user.id) || false);
      }
    }
  }, [post, user]);

  useEffect(() => {
    if (slug) {
      fetchComments();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${slug}`);
      const data = await res.json();
      if (data.success) {
        setPost(data.post);
        if (user) {
          setUserLiked(data.post.likes?.includes(user.id) || false);
          setUserDisliked(data.post.dislikes?.includes(user.id) || false);
        }
      } else {
        toast.error('Post not found');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to load post');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments');
    }
  };

  const handleLike = async (action: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Please login to like/dislike posts');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      });

      const data = await res.json();
      if (data.success) {
        setPost(data.post);
        setUserLiked(data.post.likes?.includes(user.id) || false);
        setUserDisliked(data.post.dislikes?.includes(user.id) || false);
        // Toast message will be handled by UI state change
      } else {
        toast.error(data.message || 'Failed to update like');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent, userId: user.id }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentContent('');
        fetchComments();
        toast.success('Comment added!');
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Post deleted successfully');
        router.push('/');
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('An error occurred');
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

  if (!post) {
    return null;
  }

  return (
    <Layout user={user} logout={logout}>
      <article className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-8 text-gray-600 text-sm">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="font-medium">{post.author.name}</span>
          <span>·</span>
          <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
          <span>·</span>
          <span>{calculateReadingTime(post.content)} min read</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-2 w-full">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {(isAdmin || (user && post.author._id === user.id)) && (
          <div className="mb-8 flex gap-4">
            <button
              onClick={() => router.push(`/edit/${post.slug}`)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}

        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Like/Dislike Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => handleLike('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                userLiked
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={userLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span className="font-medium">{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => handleLike('dislike')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                userDisliked
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={userDisliked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              <span className="font-medium">{post.dislikes?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentContent.trim()}
                className="mt-3 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Please login to comment</p>
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  {comment.author.image && (
                    <Image
                      src={comment.author.image}
                      alt={comment.author.name}
                      width={40}
                      height={40}
                      className="rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </Layout>
  );
}

