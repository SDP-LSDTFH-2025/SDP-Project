// src/components/Feed.jsx
import React, { useState } from "react";
import FileCard from "./FileCard";
import { Input } from "../components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getAllResources } from "../api/resources";
import "./Feed.css";

const Feed = () => {
  const [search, setSearch] = useState("");

  const {
    data: users = [],
    isLoading: loadingUsers,
    error: errorUsers,
  } = useQuery({
    queryKey: ["users"], 
    queryFn: getAllUsers,
    staleTime: 60 * 60 * 1000, // 1 hour in milliseconds
    cacheTime: 65 * 60 * 1000, // slightly longer than staleTime so it stays cached
  });

  const {
    data: files = [],
    isLoading: loadingResources,
    error: errorResources,
  } = useQuery({
    queryKey: ["resources"],
    queryFn: getAllResources,
    enabled: users.length > 0,
    staleTime: 20 * 60 * 1000,
    cacheTime: 25 * 60 * 1000,
  });
  

  const filterList = (list) =>
    list.filter(
      (f) =>
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        f.course_code?.toLowerCase().includes(search.toLowerCase())
    );

  if (loadingUsers || loadingResources) return <p>Loading resources...</p>;
  if (errorUsers || errorResources)
    return <p>Error loading resources or users.</p>;

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
