"use client";
import PostDetailPage from "@/components/Contentgenerate/post";
import BusinessHeader from "@/components/businesses/logo";
import { useEffect, useState } from "react";

const MyPostView = () => {
  const [postData, setPostData] = useState(null);

  useEffect(() => {
    // This code runs only on the client-side after the component mounts
    const storedData = localStorage.getItem("generatedContent");
    if (storedData) {
      setPostData(JSON.parse(storedData));
    }
  }, []); // The empty array ensures this runs only once

  if (!postData) {
    // You can show a loading spinner here while waiting for localStorage
    return <div>Loading generated content...</div>;
  }

  // The generated data is now available in the 'postData' state
  // We will pass the entire object to the display component
  return (
    <>
      <BusinessHeader />
      <PostDetailPage generatedData={postData} />
    </>
  );
};

export default MyPostView;