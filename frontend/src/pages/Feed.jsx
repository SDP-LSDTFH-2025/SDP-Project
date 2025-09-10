import React, { useEffect, useState } from "react";
import FileCard from "./FileCard";

const Feed = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/resources/all");
        const json = await res.json();
        if (json.success) {
          setFiles(json.data);
        }
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) return <p>Loading resources...</p>;

  return (
    <div className="feed">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
};

export default Feed;
