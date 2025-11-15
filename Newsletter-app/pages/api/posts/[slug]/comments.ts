import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { sanitizeText } from '@/lib/sanitize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await Post.findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comments = await Comment.find({ post: post._id })
        .populate('author', 'name email image')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        comments,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, userId } = req.body;

      if (!content || !userId) {
        return res.status(400).json({ message: 'Content and userId are required' });
      }

      const post = await Post.findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const sanitizedContent = sanitizeText(content);

      const comment = await Comment.create({
        content: sanitizedContent,
        author: userId,
        post: post._id,
      });

      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'name email image')
        .lean();

      return res.status(201).json({
        success: true,
        comment: populatedComment,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

