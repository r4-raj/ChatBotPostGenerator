"use client";
import React, { useState } from 'react';
import { PencilLine, Trash2, Globe, Instagram, Linkedin, Facebook, Twitter, Plus } from 'lucide-react';

// --- Platform Icon Helper ---
const platformIcons = {
  instagram: <Instagram size={16} className="mr-2" />,
  facebook: <Facebook size={16} className="mr-2" />,
  linkedin: <Linkedin size={16} className="mr-2" />,
  x: <Twitter size={16} className="mr-2" />,
};

const PostDetailPage = ({ generatedData }) => {
  if (!generatedData || !generatedData.platforms) {
    return <div>No content generated. Please go back and create a new post.</div>;
  }

  // --- UPDATED LOGIC ---
  // Destructure the main content from the top level
  const { postContent, imageUrl, platforms } = generatedData;

  // Get the list of platform names for the tabs
  const platformNames = Object.keys(platforms);
  const [activePlatform, setActivePlatform] = useState(platformNames[0]);

  // Get the hashtag data for the currently active tab
  const currentPlatformData = platforms[activePlatform];
  // --- END OF UPDATED LOGIC ---

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* ... (Top bar content remains the same) ... */}
      <div className="container mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Content and Image */}
        <div className="lg-col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          
          {/* Platform Tabs */}
          <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {platformNames.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activePlatform === platform
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {platformIcons[platform] || null}
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Post Header */}
          <h1 className="text-3xl font-bold text-slate-800">Generated Social Media Post</h1>
          
          {/* Content (Now reads from top-level 'postContent') */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Post Text</h2>
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-md border">
              <p dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br/>') }} />
            </div>
          </div>

           {/* Hashtags (Reads from the platform-specific 'currentPlatformData') */}
           <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Suggested Hashtags for {activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}</h3>
            <div className="flex flex-wrap gap-2">
              {currentPlatformData.hashtags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Image (Now reads from top-level 'imageUrl') */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Generated Image</h2>
            <div className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              {imageUrl ? (
                <img src={imageUrl} alt="Generated post" className="w-full h-auto object-cover max-h-96" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-slate-500 bg-slate-100">
                  Image not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Post Details and Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* ... (Right column components remain the same) ... */}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;