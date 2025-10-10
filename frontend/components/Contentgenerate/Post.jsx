// /components/Contentgenerate/post.jsx

"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Instagram, Facebook, Linkedin, Twitter, Edit, RefreshCw, Copy, Trash2, Plus } from 'lucide-react';

// --- Helper Components ---
const platformIcons = {
  instagram: <Instagram size={16} />,
  facebook: <Facebook size={16} />,
  linkedin: <Linkedin size={16} />,
  x: <Twitter size={16} />,
};

const PostEditor = () => {
  const router = useRouter();
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [editedHashtags, setEditedHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  function handlerRegenerate() {
    router.push('/content/generate');
  }
  
  
  useEffect(() => {
    // Get data from localStorage instead of making API call
    const storedData = localStorage.getItem('generatedContent');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setGeneratedData(parsedData);
        const platforms = Object.keys(parsedData);
        if (platforms.length > 0) {
          setActiveTab(platforms[0]);
        }
      } catch (err) {
        console.error("Error parsing stored data:", err);
        setError("Error loading stored content data");
      }
    } else {
      setError("No generated content found in storage");
    }
    setLoading(false);
  }, []);

  // --- Conditional Rendering ---
  if (loading) {
    return <div className="text-center p-4">Loading post...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (!generatedData || Object.keys(generatedData).length === 0) {
    return <div className="text-center p-8">No generated content found in storage.</div>;
  }

  const platforms = Object.keys(generatedData);
  // Use data from the first platform for the main display
  const mainPostData = generatedData[platforms[0]]; 
  // Get content for the currently active tab
  const activeTabData = generatedData[activeTab];

  const startEditing = () => {
    if (!activeTab) return;
    setEditedText(activeTabData?.postContent || '');
    setEditedHashtags((activeTabData?.hashtags || []).join(' '));
    setIsEditing(true);
  };

  const hasChanges = isEditing && (
    editedText !== (activeTabData?.postContent || '') ||
    editedHashtags.trim() !== (activeTabData?.hashtags || []).join(' ')
  );

  const saveEdits = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const updated = { ...generatedData };
      updated[activeTab] = {
        ...updated[activeTab],
        postContent: editedText,
        hashtags: editedHashtags.split(/\s+/).map(h => h.trim()).filter(Boolean),
      };
      setGeneratedData(updated);
      localStorage.setItem('generatedContent', JSON.stringify(updated));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('authToken');
      await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });

      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save post edits', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
      {/* Left Column - Main Post Content */}
      <div className="flex-1 bg-white shadow rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
            Celebrating Our Innovative Team Spirit
          </h1>
          <div className="flex space-x-2">
            <button onClick={startEditing} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
              <Edit size={14} />
              <span>Edit Post</span>
            </button>
            <button onClick={handlerRegenerate} className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
              <RefreshCw size={14} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Main area: Image + Platform-specific content side-by-side */}
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Image */}
          <div className="lg:col-span-7">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Post Image</h2>
            <div className="w-full rounded-lg shadow-md border bg-white">
              <img
                src={mainPostData.imageUrl}
                alt="Generated Post"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Platform-specific generated content */}
          <div className="lg:col-span-5 self-stretch h-full">
            <div className="mb-4 border-b">
              <nav className="flex space-x-4">
                {platforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => setActiveTab(platform)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium capitalize ${
                      activeTab === platform
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {platformIcons[platform]}
                    {platform}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Post Text for {activeTab}</h3>
              {isEditing ? (
                <textarea
                  className="w-full text-sm rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={6}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              ) : (
                <p
                  className="text-gray-700 text-sm"
                  dangerouslySetInnerHTML={{ __html: activeTabData.postContent.replace(/\n/g, '<br/>') }}
                />
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Suggested Hashtags for {activeTab}</h3>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full text-sm rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editedHashtags}
                  onChange={(e) => setEditedHashtags(e.target.value)}
                  placeholder="#tag1 #tag2"
                />
              ) : (
                <p className="text-blue-600 text-sm">{activeTabData.hashtags.join(' ')}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => console.log('Post now clicked for', activeTab)}
              >
                Post
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-white text-indigo-700 border border-indigo-200 text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => console.log('Schedule post clicked for', activeTab)}
              >
                Schedule Post
              </button>
              {isEditing && (
                <button
                  type="button"
                  disabled={!hasChanges || isSaving}
                  className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    !hasChanges || isSaving
                      ? 'bg-emerald-300 text-white cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  onClick={saveEdits}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Post Details & Actions */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Post Details</h2>
          {/* NOTE: This data is static. You'll need to add it to your localStorage object to make it dynamic. */}
          <div className="text-sm text-gray-600 space-y-2">
            <p><span className="font-medium text-gray-700">Status:</span> Generated</p>
            <p><span className="font-medium text-gray-700">Category:</span> AI GENERATED, DALL-E</p>
            <p><span className="font-medium text-gray-700">Model:</span> gpt-4</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Publish To Social Media</h2>
          <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
             <Plus size={24} className="mb-1"/>
            <span>No social platforms connected</span>
            <button className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm hover:bg-indigo-100">
              Connect platforms
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Other Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100">
              <Copy size={16} />
              <span>Duplicate Post</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100">
              <Trash2 size={16} />
              <span>Delete Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;