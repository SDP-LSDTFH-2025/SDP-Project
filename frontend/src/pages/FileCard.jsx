import React, { useState } from "react";
import "./FileCard.css";
import { Heart, MessageCircle, Share2, Download, X } from "lucide-react";

const FileCard = ({ file }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [likes, setLikes] = useState(file.likes || 0);
  const [liked, setLiked] = useState(false);

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

  // optimistic update
  setLiked(true);
  setLikes(likes + 1);

  try {

    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER || "http://localhost:3000";
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


  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      author: "John Doe",
      initials: "JD",
      text: commentText,
      time: "Just now",
    };
    setComments([...comments, newComment]);
    setCommentText("");
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

      // cleanup
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // detect file type (pdf vs image)
  const isPdf = file.file_url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="file-card">
      {/* Header */}
      <div className="file-header">
        <div className="file-user">
          <div className="file-avatar">{file.initials}</div>
          <div>
            <div className="file-author">{file.user_name.replaceAll('_', ' ')}</div>
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

      {/* Preview (click to open fullscreen) */}
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
        {comments.map((c, i) => (
          <div key={i} className="comment">
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
          <div className="comment-avatar">JD</div>
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
