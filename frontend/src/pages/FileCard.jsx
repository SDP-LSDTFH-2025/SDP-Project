import React, { useState, useEffect } from "react";
import "./FileCard.css";
import { Heart, MessageCircle, Share2, Download, X } from "lucide-react";

const FileCard = ({ file }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [likes, setLikes] = useState(file.likes || 0);
  const [liked, setLiked] = useState(false);

  let initial_user = JSON.parse(localStorage.getItem("user")).username.split("_").map((n) => n[0]).join("").toUpperCase();
  const SERVER =
    import.meta.env.VITE_PROD_SERVER ||
    import.meta.env.VITE_DEV_SERVER ||
    "http://localhost:3000";

  // ⬇️ Load comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${SERVER}/api/v1/resource_threads?resource_id=${file.id}`
        );
        const data = await res.json();

        if (data.success) {
          const enrichedComments = await Promise.all(
            data.data.map(async (c) => {
              try {
                const userRes = await fetch(`${SERVER}/api/v1/users/${c.user_id}`);
                const userData = await userRes.json();

                if (userData.success) {
                  const username = userData.data.username;
                  const initials = username
                    .split("_")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  
                  return {
                    id: c.id,
                    text: c.message,
                    author: username.replaceAll("_", " "),
                    initials,
                    time: new Date(c.created_at).toLocaleString(),
                  };
                }
              } catch (err) {
                console.error("User fetch error:", err);
              }

              // fallback if user fetch fails
              return {
                id: c.id,
                text: c.message,
                author: `User ${c.user_id}`,
                initials: c.user_id.toString().slice(0, 2).toUpperCase(),
                time: new Date(c.created_at).toLocaleString(),
              };
            })
          );

          setComments(enrichedComments);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };

    fetchComments();
  }, [file.id, SERVER]);

  const formatTimeAgo = (dateString) => {
    const createdAt = new Date(dateString);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }

    return createdAt.toLocaleString(); // fallback to full date after 24h
  };

  // LIKE handler
  const handleLike = async () => {
    if (liked) return; // prevent multiple likes from same user for now

    setLiked(true);
    setLikes(likes + 1);

    try {
      const res = await fetch(`${SERVER}/api/v1/resources/${file.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        setLikes(data.data.likes);
      } else {
        setLiked(false);
        setLikes(file.likes);
      }
    } catch (err) {
      console.error("Like error:", err);
      setLiked(false);
      setLikes(likes);
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const stored = JSON.parse(localStorage.getItem("user")); // assuming user saved as JSON
    const newComment = {
      user_id: stored.id,
      resource_id: file.id,
      message: commentText.trim(),
      parent_id: 0,
    };

    try {
      const res = await fetch(`${SERVER}/api/v1/resource_threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      const data = await res.json();
      
      if (data.success && data.data) {
        const savedComment = {
          id: data.data.id,
          author: stored.username.replaceAll("_", " "),
          initials: stored.username
            .split("_")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          text: data.data.message,
          time: "Just now",
        };

        setComments([...comments, savedComment]);
        setCommentText("");
      } else {
        console.error("Failed to save comment:", data);
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const isPdf = file.file_url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="file-card">
      {/* Header */}
      <div className="file-header">
        <div className="file-user">
          <div className="file-avatar">{file.initials}</div>
          <div>
            <div className="file-author">{file.user_name.replaceAll("_", " ")}</div>
            <div className="file-meta">
              {formatTimeAgo(file.created_at)} • {file.course_code}
            </div>
          </div>
        </div>
        <span className="file-badge">{isPdf ? "PDF" : "IMG"}</span>
      </div>

      {/* Title & Description */}
      <h3 className="file-title">{file.title}</h3>
      <p className="file-description">{file.description}</p>

      {/* Preview */}
      <div className="file-preview" onClick={() => setShowModal(true)}>
        {isPdf ? (
          <>
            <div className="pdf-box">
              <strong>{file.title}</strong>
            </div>
            <div className="pdf-viewer">
              <iframe src={file.file_url} title={file.title}></iframe>
            </div>
          </>
        ) : (
          <img
            src={file.pictures_url || file.file_url}
            alt={file.title}
            className="img-preview"
          />
        )}
      </div>

      {/* Footer */}
      <div className="file-footer">
        <div className="file-actions">
          <span
            className={`like-btn ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={18} fill={liked ? "red" : "none"} />
            {likes}
          </span>
          <span>
            <MessageCircle size={18} /> {comments.length}
          </span>
          <span>
            <Share2 size={18} />
          </span>
        </div>
        <button
          onClick={() =>
            handleDownload(file.file_url || file.pictures_url, file.title)
          }
          className="download-btn"
        >
          <Download size={18} /> Download
        </button>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="comment-avatar">{c.initials}</div>
            <div className="comment-body">
              <strong>{c.author}</strong>
              <p>{c.text}</p>
              <span className="comment-time">{c.time}</span>
            </div>
          </div>
        ))}

        {/* Add Comment */}
        <div className="comment-input">
          <div className="comment-avatar"> {initial_user} </div>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showModal && (
        <div className="fullscreen-modal">
          <button className="close-btn" onClick={() => setShowModal(false)}>
            <X size={26} />
          </button>
          {isPdf ? (
            <iframe
              src={file.file_url}
              title={file.title}
              className="fullscreen-pdf"
            ></iframe>
          ) : (
            <img
              src={file.pictures_url || file.file_url}
              alt={file.title}
              className="fullscreen-img"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FileCard;
