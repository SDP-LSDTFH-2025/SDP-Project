// src/components/Feed.jsx
import React, { useState } from "react";
import FileCard from "./FileCard";
import { Input } from "../components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getAllResources } from "../api/resources";
import "./Feed.css";

const Feed = () => {
  const [search, setSearch] = useState("");

  const {
    data: files = [],
    isLoading: loadingResources,
    error: errorResources,
  } = useQuery({
    queryKey: ["resources"],
    queryFn: getAllResources,
    staleTime: 20 * 60 * 1000,
    cacheTime: 25 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes("not authenticated")) {
        return false;
      }
      return failureCount < 3;
    },
  });
  

  const filterList = (list) =>
    list.filter(
      (f) =>
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        f.course_code?.toLowerCase().includes(search.toLowerCase())
    );

  if (loadingResources) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Loading resources...</p>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '1rem auto'
      }}></div>
    </div>
  );
  if (errorResources)
    return <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error loading resources.</p>;

  return (
    <>
      <div className="search-input">
        <Input
          className="search"
          placeholder="Search resource by Title, Course Code, or Username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="feed">
        {filterList(files).map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </>
  );
};

export default Feed;
