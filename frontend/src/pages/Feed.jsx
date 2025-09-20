import React, { useEffect, useState } from "react";
import FileCard from "./FileCard";
import { Search } from "lucide-react";
import "./Feed.css";
const Feed = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";
        const res = await fetch(`${SERVER}/api/v1/resources/all`);
        const json = await res.json();

        if (json.success) {
          const enrichedResources = await Promise.all(
            json.data.map(async (resource) => {
              try {
                const userRes = await fetch(
                  `${SERVER}/api/v1/users/${resource.user_id}`
                );
                const userData = await userRes.json();
                console.log(userData);
                if (userData.success) {
                  const username = userData.data.username;
                  const initials = username
                    .split("_")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return {
                    ...resource,
                    user_name: username,
                    initials,
                  };
                }
              } catch (err) {
                console.error("User fetch error:", err);
              }

              return {
                ...resource,
                user_name: `User ${resource.user_id.slice(0, 4)}`,
                initials: resource.user_id.slice(0, 2).toUpperCase(),
              };
            })
          );

          setFiles(enrichedResources);
        }
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const filterList = (list) =>
    list.filter(
      (f) =>
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.username?.toLowerCase().includes(search.toLowerCase()) ||
        f.course_code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading resources...</p>;

  return (
    <>
      <div className="search-input">
        <Search size={16} className="search-icon" />
        <input
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
