import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditPost({ user, logout }: any) {
  const router = useRouter();
  const { slug } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin' && slug) {
      // Check post author AFTER post is loaded (in fetchPost)
        // no redirect here
    }
    if (slug) {
      fetchPost();
    }
  }, [slug, user, router]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${slug}`);
      const data = await res.json();
      if (data.success) {
        const post = data.post;
        // Now check auth: allow if admin or their own post
        if (!(user.role === 'admin' || post.author._id === user.id)) {
          toast.error('You are not authorized to edit this post');
          router.push('/');
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCoverImage(post.coverImage || '');
        setTags(post.tags.join(', '));
        setPublished(post.published);
      } else {
        toast.error('Post not found');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to load post');
      router.push('/');
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });

        const data = await res.json();
        if (data.success) {
          setCoverImage(data.url);
          toast.success('Image uploaded successfully!');
        } else {
          toast.error('Failed to upload image');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };

  const handleImageInsert = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64String }),
          });

          const data = await res.json();
          if (data.success) {
            // Access Quill instance from the editor element
            const editor = quillContainerRef.current?.querySelector('.ql-editor') as any;
            const quill = editor?.__quill;
            if (quill) {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', data.url);
              quill.setSelection(range.index + 1);
            }
            toast.success('Image uploaded successfully!');
          } else {
            toast.error('Failed to upload image');
          }
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Failed to upload image');
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please provide title and content');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          coverImage,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          published,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Post updated successfully!');
        router.push(`/posts/${data.post.slug}`);
      } else {
        toast.error(data.message || 'Failed to update post');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
      handlers: {
        image: handleImageInsert,
      },
    },
  };

  if (fetching || !user) {
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

  return (
    <Layout user={user} logout={logout}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold border-none outline-none bg-transparent"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Excerpt (optional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-lg border-none outline-none bg-transparent text-gray-600"
            />
          </div>

          {coverImage && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : coverImage ? 'Change Cover Image' : 'Add Cover Image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div ref={quillContainerRef} className="bg-white rounded-lg border border-gray-200">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Start writing your story..."
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="mr-2"
              />
              <span>Publish</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

