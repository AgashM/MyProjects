import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User'; // Import User model to ensure it's registered
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', published = 'true' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const query: any = {};
      if (published === 'true') {
        query.published = true;
      }

      const posts = await Post.find(query)
        .populate('author', 'name email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Filter out posts where author is missing (e.g. deleted user)
      const filteredPosts = posts.filter((post: any) => post.author);

      const total = await Post.countDocuments(query);

      // Convert ObjectIds to strings for likes and dislikes
      const postsWithStringIds = filteredPosts.map((post: any) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes.map((id: any) => id.toString()) : [],
        dislikes: Array.isArray(post.dislikes) ? post.dislikes.map((id: any) => id.toString()) : [],
      }));

      // Set cache headers (5 minutes for published posts)
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

      return res.status(200).json({
        success: true,
        posts: postsWithStringIds,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('API /api/posts error:', error);
      return res.status(500).json({ message: error.message || 'Server error', stack: error.stack });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, excerpt, coverImage, tags, published, authorId } = req.body;

      if (!title || !content || !authorId) {
        return res.status(400).json({ message: 'Please provide title, content, and authorId' });
      }

      // Check if user is admin
      const user = await User.findById(authorId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create posts' });
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingPost = await Post.findOne({ slug });
      if (existingPost) {
        return res.status(400).json({ message: 'A post with this title already exists' });
      }

      // Sanitize user input to prevent XSS attacks
      const sanitizedContent = sanitizeHtml(content);
      const sanitizedTitle = sanitizeText(title);
      const sanitizedExcerpt = excerpt ? sanitizeText(excerpt) : undefined;
      const sanitizedTags = (tags || []).map((tag: string) => sanitizeText(tag));

      const post = await Post.create({
        title: sanitizedTitle,
        slug,
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        coverImage,
        tags: sanitizedTags,
        published: published || false,
        author: authorId,
      });

      const populatedPost = await Post.findById(post._id).populate('author', 'name email image');

      return res.status(201).json({
        success: true,
        post: populatedPost,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

