import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  logout?: () => void;
}

export default function Layout({ children, user, logout }: LayoutProps) {
  const router = useRouter();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Newsletter Blog
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      href="/write"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Write
                    </Link>
                  )}
                  <div ref={avatarMenuRef} className="relative flex items-center space-x-2">
                    <button
                      className="focus:outline-none flex items-center space-x-2"
                      onClick={() => setAvatarMenuOpen((m) => !m)}
                      aria-label="Account"
                    >
                      <span className="font-medium text-gray-800 text-base truncate max-w-[120px]">{user.name}</span>
                      <span className="block w-9 h-9 rounded-full overflow-hidden border-2 border-primary-600 bg-gray-200">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || 'Avatar'}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        ) : (
                          <Image
                            src={user.role === 'admin' ? '/avatars/cat.png' : user.role === 'user' ? '/avatars/dog.png' : '/avatars/default.png'}
                            alt="User Avatar"
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        )}
                      </span>
                    </button>
                    {avatarMenuOpen && (
                      <div className="absolute top-full mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-40">
                        <Link href={`/profile/${user.id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          My Profile
                        </Link>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
      
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 text-sm">
                A platform for sharing stories, ideas, and expertise. Join our community of writers and readers.
              </p>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:agashmahendran@gmail.com" className="hover:text-primary-600">
                    agashmahendran@gmail.com
                  </a>
                </p>
                <div className="pt-2">
                  <p className="font-medium mb-2">Follow Me:</p>
                  <div className="flex space-x-4">
                    <a href="https://github.com/AgashM" className="text-gray-600 hover:text-primary-600" aria-label="Github">
                      Github
                    </a>
                    <a href="https://www.linkedin.com/in/agash-m" className="text-gray-600 hover:text-primary-600" aria-label="LinkedIn">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-primary-600">
                    Home
                  </Link>
                </li>
                {/* 'Write a Story' quick link removed per request */}
                {!user && (
                  <>
                    <li>
                      <Link href="/login" className="text-gray-600 hover:text-primary-600">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="text-gray-600 hover:text-primary-600">
                        Get Started
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-600">© 2025 Newsletter Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

