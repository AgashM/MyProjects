# Quick Start Guide

Get your newsletter blog platform up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A GitHub account (for deployment)
- 10 minutes of your time

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a cluster (choose FREE tier)
4. Create a database user (save the password!)
5. Whitelist IP: Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string: Click "Connect" → "Connect your application"
7. Copy the connection string and replace `<password>` with your password

## Step 3: Set Up Cloudinary (Free)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free
3. Copy from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsletter-blog?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Create Your First Account

1. Click "Get Started"
2. Fill in your details
3. You're in!

## Step 7: Write Your First Post

1. Click "Write" in the navigation
2. Add a title
3. Write your content
4. Add a cover image (optional)
5. Click "Publish"
6. Your post will display an estimated reading time automatically!

## Deploy for Free

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel:

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

Your app will be live in 2 minutes! 🚀

## Troubleshooting

### Can't connect to MongoDB?
- Check your IP is whitelisted
- Verify connection string has correct password
- Make sure cluster is running

### Images not uploading?
- Verify Cloudinary credentials
- Check image size (max 10MB)

### Build errors?
- Run `npm install` again
- Check Node.js version (18+)

## Need Help?

Check the full [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.

Happy blogging! ✍️

