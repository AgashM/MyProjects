# Newsletter Blog Platform

A full-featured newsletter and blog platform inspired by Medium, built with Next.js, MongoDB, and Cloudinary.

## Features

- ✍️ **Rich Text Editor** - Write beautiful blog posts with a WYSIWYG editor
- 🖼️ **Image Upload** - Upload and manage images using Cloudinary
- 👤 **User Authentication** - Sign up, login, and user profiles
- 📝 **Blog Management** - Create, edit, delete, and publish blog posts
- 📧 **Newsletter Subscription** - Subscribe/unsubscribe to newsletters
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔍 **SEO Friendly** - Optimized for search engines
- 📱 **Mobile Responsive** - Works perfectly on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (MongoDB Atlas)
- **Image Storage**: Cloudinary
- **Authentication**: Custom JWT-based auth with localStorage
- **Rich Text Editor**: React Quill

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd newsletter-blog-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Free Deployment Guide

### Option 1: Vercel (Recommended - Easiest)

Vercel offers free hosting for Next.js applications with excellent performance.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

3. **Import your project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Add Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all variables from your `.env.local`:
     - `MONGODB_URI`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `NEXTAUTH_URL` (use your Vercel URL: `https://your-app.vercel.app`)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify

1. **Push code to GitHub** (same as above)

2. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

3. **Deploy**
   - Click "New site from Git"
   - Connect GitHub and select your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

4. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add all your environment variables

### Setting up MongoDB Atlas (Free)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Choose "Free" tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your Vercel/Netlify IP ranges

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `newsletter-blog`)

### Setting up Cloudinary (Free)

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to Environment Variables**
   - Add these to your `.env.local` and deployment platform

## Project Structure

```
├── components/          # React components
│   └── Layout.tsx       # Main layout component
├── lib/                 # Utility functions
│   └── mongodb.ts      # MongoDB connection
├── models/             # Mongoose models
│   ├── User.ts
│   ├── Post.ts
│   └── Newsletter.ts
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── _app.tsx       # App wrapper
│   ├── index.tsx      # Home page
│   ├── login.tsx      # Login page
│   ├── register.tsx   # Register page
│   ├── write.tsx      # Write post page
│   └── posts/         # Post pages
├── styles/            # Global styles
│   └── globals.css
└── public/            # Static files
```

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/[slug]` - Get single post
- `PUT /api/posts/[slug]` - Update post
- `DELETE /api/posts/[slug]` - Delete post
- `POST /api/upload` - Upload image to Cloudinary
- `POST /api/newsletter` - Subscribe to newsletter
- `DELETE /api/newsletter` - Unsubscribe from newsletter

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXTAUTH_URL` | Your application URL |

## Free Tier Limits

### MongoDB Atlas
- 512 MB storage
- Shared RAM
- Perfect for small to medium applications

### Cloudinary
- 25 GB storage
- 25 GB bandwidth/month
- Perfect for image hosting

### Vercel
- Unlimited deployments
- 100 GB bandwidth/month
- Perfect for hosting

## Troubleshooting

### MongoDB Connection Issues
- Check your IP is whitelisted
- Verify connection string has correct password
- Ensure database user has proper permissions

### Image Upload Issues
- Verify Cloudinary credentials
- Check image size (max 10MB)
- Ensure CORS is configured

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

