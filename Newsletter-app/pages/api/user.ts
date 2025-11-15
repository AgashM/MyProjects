import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing user id' });
    }
    const user = await User.findById(id).select('name email bio image role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Server Error' });
  }
}
