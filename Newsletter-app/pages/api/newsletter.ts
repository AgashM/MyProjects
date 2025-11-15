import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
      }

      const existing = await Newsletter.findOne({ email });
      if (existing) {
        if (existing.subscribed) {
          return res.status(400).json({ message: 'Email already subscribed' });
        } else {
          existing.subscribed = true;
          existing.subscribedAt = new Date();
          existing.unsubscribedAt = undefined;
          await existing.save();
          return res.status(200).json({
            success: true,
            message: 'Successfully resubscribed to newsletter',
          });
        }
      }

      await Newsletter.create({
        email,
        subscribed: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
      }

      const newsletter = await Newsletter.findOne({ email });
      if (!newsletter) {
        return res.status(404).json({ message: 'Email not found' });
      }

      newsletter.subscribed = false;
      newsletter.unsubscribedAt = new Date();
      await newsletter.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

