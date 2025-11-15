import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;
    const { userId, action } = req.body; // action: 'like' or 'dislike'

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike"' });
    }

    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const mongoose = await import('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Toggle logic: Remove from opposite array first, then toggle current action
    if (action === 'like') {
      // Remove from dislikes
      post.dislikes = post.dislikes.filter(
        (id: any) => id.toString() !== userObjectId.toString()
      );
      // Toggle like
      const likeIndex = post.likes.findIndex(
        (id: any) => id.toString() === userObjectId.toString()
      );
      if (likeIndex >= 0) {
        // Already liked, remove it
        post.likes.splice(likeIndex, 1);
      } else {
        // Not liked, add it
        post.likes.push(userObjectId);
      }
    } else {
      // Remove from likes
      post.likes = post.likes.filter(
        (id: any) => id.toString() !== userObjectId.toString()
      );
      // Toggle dislike
      const dislikeIndex = post.dislikes.findIndex(
        (id: any) => id.toString() === userObjectId.toString()
      );
      if (dislikeIndex >= 0) {
        // Already disliked, remove it
        post.dislikes.splice(dislikeIndex, 1);
      } else {
        // Not disliked, add it
        post.dislikes.push(userObjectId);
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email image')
      .lean();

    // Convert ObjectIds to strings
    const postWithStringIds = {
      ...updatedPost,
      likes: post.likes.map((id: any) => id.toString()),
      dislikes: post.dislikes.map((id: any) => id.toString()),
    };

    return res.status(200).json({
      success: true,
      post: postWithStringIds,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

