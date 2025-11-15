import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User'; // Import User model to ensure it's registered
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await Post.findOne({ slug })
        .populate('author', 'name email image bio')
        .lean();

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Convert ObjectIds to strings for likes and dislikes
      const postWithStringIds = {
        ...post,
        likes: post.likes?.map((id: any) => id.toString()) || [],
        dislikes: post.dislikes?.map((id: any) => id.toString()) || [],
      };

      return res.status(200).json({
        success: true,
        post: postWithStringIds,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, content, excerpt, coverImage, tags, published, userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      const post = await Post.findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (user.role !== 'admin' && String(post.author) !== String(user._id)) {
        return res.status(403).json({ message: 'You are not authorized to edit this post' });
      }

      if (title && title !== post.title) {
        const sanitizedTitle = sanitizeText(title);
        const newSlug = sanitizedTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const existingPost = await Post.findOne({ slug: newSlug });
        if (existingPost && (existingPost._id as any).toString() !== (post._id as any).toString()) {
          return res.status(400).json({ message: 'A post with this title already exists' });
        }
        post.slug = newSlug;
        post.title = sanitizedTitle;
      }

      if (content) post.content = sanitizeHtml(content);
      if (excerpt !== undefined) post.excerpt = excerpt ? sanitizeText(excerpt) : excerpt;
      if (coverImage !== undefined) post.coverImage = coverImage;
      if (tags) post.tags = tags.map((tag: string) => sanitizeText(tag));
      if (published !== undefined) post.published = published;

      await post.save();

      const updatedPost = await Post.findById(post._id).populate('author', 'name email image');

      return res.status(200).json({
        success: true,
        post: updatedPost,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      const post = await Post.findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      if (user.role !== 'admin' && String(post.author) !== String(user._id)) {
        return res.status(403).json({ message: 'You are not authorized to delete this post' });
      }

      const deletedPost = await Post.findOneAndDelete({ slug });
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

