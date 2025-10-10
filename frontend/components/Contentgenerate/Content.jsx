"use client";
import React from "react";
import { useState } from "react";
import { Plus, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { useRouter } from 'next/navigation'; // Correct import for Next.js App Router

// --- Platform Data ---
const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={20} className="text-slate-500" /> },
  { id: 'x', name: 'X (Twitter)',  icon: <Twitter size={20} className="text-slate-500" />  },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={20} className="text-slate-500" /> },
  { id: 'facebook', name: 'Facebook', icon: <Facebook size={20} className="text-slate-500" /> },
];

const GenerateAIContent = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState({});
  const [brief, setBrief] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // Optional: to show a temporary result on this page
  const router = useRouter();

  const handlePlatformChange = (platformId) => {
    setSelectedPlatforms((prevSelected) => ({
      ...prevSelected,
      [platformId]: !prevSelected[platformId],
    }));
  };

  /**
   * Helper function to save the generated content to the database.
   * @param {object} generatedData - The data object received from the AI generation API.
   * @param {string} token - The user's authentication token.
   */
  const saveContentToDb = async (generatedData, token) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/posts`, { // Calling the /posts endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(generatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save the post to the database.');
      }
      console.log("Content saved to database successfully!");
    } catch (error) {
      console.error("Error saving to DB:", error.message);
      // We can set an error state here to inform the user
      setError("Content was generated but failed to save. You can try saving it manually later.");
    }
  };

  /**
   * Main function to handle the entire content generation and saving process.
   */
  const handleGenerateContent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found. Please log in again.');

      // --- Step 1: Generate Content ---
      const generateResponse = await fetch(`${apiUrl}/create-content-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          brief,
          platforms: Object.keys(selectedPlatforms).filter((key) => selectedPlatforms[key]),
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.message || 'Failed to generate content.');
      }
      const generatedData = await generateResponse.json();
      setResult(generatedData); // Show temporary result on this page if needed

      // --- Step 2: Save the successful result to the database ---
      await saveContentToDb(generatedData, token);

      // --- Step 3: Store in localStorage for the next page and navigate ---
      localStorage.setItem('generatedContent', JSON.stringify(generatedData));
      router.push('/content/post');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-800 p-6 lg:p-8">
      <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-6 lg:p-8">
        
        {/* Creative Brief Section */}
        <div className="pb-8 border-b border-slate-200 mb-8">
          <h2 className="text-xl font-semibold text-slate-800">Creative Brief</h2>
          <p className="text-slate-600 mt-1">
            Describe the topic or idea for your social media post. The more detail, the better the result.
          </p>
          <div className="mt-4">
            <textarea
              className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32 resize-none"
              placeholder="e.g., A post about the top 5 benefits of using our new productivity app..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Target Platforms Section */}
        <div className="pb-8 border-b border-slate-200 mb-8">
          <h2 className="text-xl font-semibold text-slate-800">Target Platforms</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => (
              <label
                key={platform.id}
                htmlFor={platform.id}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedPlatforms[platform.id]
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                {platform.icon}
                <span className="font-medium text-slate-700 flex-grow">{platform.name}</span>
                <input
                  type="checkbox"
                  id={platform.id}
                  name={platform.id}
                  checked={!!selectedPlatforms[platform.id]}
                  onChange={() => handlePlatformChange(platform.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-4">
            Select the social media platforms you want to target.
          </p>
        </div>

        {/* Footer Buttons */}
        <form onSubmit={handleGenerateContent} className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50"
            onClick={() => {
              setBrief("");
              setSelectedPlatforms({});
              setResult(null);
              setError(null);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              <><Plus size={16} className="mr-2 -ml-1" /> Generate Content</>
            )}
          </button>
        </form>

        {/* Error and Result Display */}
        {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
        {result && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Generation Successful! Redirecting...</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateAIContent;