import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, User } from 'lucide-react';
import Footer from '../components/Footer';

type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  image?: string;
  createdAt?: string;
  date?: string;
};

const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await fetch(`${API_BASE}/api/blogs`);
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        const normalized = (data as any[]).map((post) => ({
          id: post._id || post.id,
          title: post.title || '',
          summary: post.summary || '',
          content: post.content || '',
          author: post.author || 'Hotel Team',
          image: post.image || '',
          createdAt: post.createdAt,
          date: post.date,
        }));
        setPosts(normalized);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to load blogs');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#3f4a40] text-[#efece6] relative overflow-hidden pt-10 md:pt-0">
      {/* Background Gradients */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(88,105,90,0.35), transparent 55%), radial-gradient(circle at 85% 60%, rgba(98,120,100,0.35), transparent 60%), linear-gradient(180deg, rgba(23,30,24,0.9), rgba(23,30,24,0.55))',
        }}
      />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(180deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:100%_160px]" />

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl mb-4 tracking-tight" style={{ fontFamily: "'Great Vibes', cursive" }}>Hotel Blog</h1>
          <div className="h-px w-24 bg-[#5b6255] mb-4" />
          <p className="text-[#c9c3b6] uppercase tracking-[0.2em] text-xs">
            Stories, tips, and news from On Earth Hotel
          </p>
        </div>

        {isLoading && (
          <div className="rounded-[2rem] border border-[#5b6659] bg-[#2f3a32]/90 p-8 text-[#c9c3b6] text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-60" />
            Loading blog posts...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-[2rem] border border-red-400/40 bg-[#3a2f2f] p-8 text-red-200 text-center">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && posts.length === 0 && (
          <div className="rounded-[2rem] border border-[#5b6659] bg-[#2f3a32]/90 p-8 text-[#c9c3b6] text-center">
            No blog posts available yet.
          </div>
        )}

        {!isLoading && !loadError && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="rounded-[2rem] border border-[#5b6659] bg-[#2f3a32]/90 overflow-hidden shadow-lg hover:shadow-xl hover:border-[#7a8d78] transition-all duration-300 flex flex-col h-full group">
                {/* Blog Image */}
                {post.image && (
                  <div className="w-full h-56 overflow-hidden rounded-t-[2rem] bg-[#1a2119]">
                    <img
                      src={`${API_BASE}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Blog Title */}
                  <h2 className="text-xl font-semibold mb-3 text-[#efece6] line-clamp-2 hover:text-[#d7d0bf] transition-colors duration-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {post.title}
                  </h2>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4 text-xs text-[#c9c3b6]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#d7d0bf]" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#d7d0bf]" />
                      <span>{new Date(post.createdAt || post.date || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Blog Summary */}
                  <p className="text-[#c9c3b6] text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {post.summary}
                  </p>

                  {/* Read More */}
                  {post.content && (
                    <details className="mt-auto">
                      <summary className="cursor-pointer text-[#d7d0bf] hover:text-[#efece6] transition-colors duration-200 text-sm font-medium flex items-center gap-2 group/details">
                        <span>Read More</span>
                        <span className="group-open/details:rotate-90 transition-transform duration-300">→</span>
                      </summary>
                      <div className="mt-3 text-[#c9c3b6] text-sm leading-relaxed border-t border-[#5b6659] pt-3 max-h-64 overflow-y-auto">
                        {post.content}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
