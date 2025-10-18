import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Download, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  getAllUsers,
  getResourceComments,
  checkLike,
  toggleLike,
  addResourceComment,
  deleteResource,
  updateResource,
} from "../api/resources";
import "./FileCard.css";

const FileCard = ({ file }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [likes, setLikes] = useState(file.likes || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(file.title);
  const [editDescription, setEditDescription] = useState(file.description);
  
  const queryClient = useQueryClient();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const initial_user = storedUser.username
    .split("_")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 60 * 60 * 1000,
    cacheTime: 65 * 60 * 1000,
  });

  useEffect(() => {
    const fetchCommentsAndLikes = async () => {
      try {
        const data = await getResourceComments(file.id);
        if (data.success) {
          const enrichedComments = data.data.map((c) => {
            const user = allUsers.find((u) => u.id === c.user_id);
            return {
              id: c.id,
              text: c.message,
              author: user
                ? user.username.replaceAll("_", " ")
                : `User ${c.user_id}`,
              initials: user
                ? user.username
                    .split("_")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : c.user_id.toString().slice(0, 2).toUpperCase(),
              time: formatTimeAgo(c.created_at),
            };
          });
          setComments(enrichedComments);
        }

        const likeStatus = await checkLike(file.id, storedUser.id);
        if (likeStatus.success) setLiked(likeStatus.liked);
      } catch (err) {
        console.error("Error fetching comments/likes:", err);
      }
    };

    if (!loadingUsers && allUsers.length) {
      fetchCommentsAndLikes();
    }
  }, [file.id, allUsers, loadingUsers, storedUser.id]);

  const formatTimeAgo = (dateString) => {
    const createdAt = new Date(dateString);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) return `${diffHours} hours ago`;
    return createdAt.toLocaleString();
  };

  const handleLike = async () => {
    try {
      const data = await toggleLike(file.id, storedUser.id, liked);
      if (data.success) {
        setLikes((prev) => prev + (liked ? -1 : 1));
        setLiked(!liked);
      }
    } catch (err) {
      console.error("Like error:", err);
      setLiked(false);
      setLikes(likes);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const data = await addResourceComment({
        userId: storedUser.id,
        fileId: file.id,
        message: commentText.trim(),
      });

      if (data.success && data.data) {
        setComments((prev) => [
          ...prev,
          {
            id: data.data.id,
            author: storedUser.username.replaceAll("_", " "),
            initials: initial_user,
            text: data.data.message,
            time: "Just now",
          },
        ]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: file.title,
      text: file.description,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const shareText = `${file.title}\n\n${file.description}\n\nCourse: ${file.course_code}\nAuthor: ${file.user_name.replaceAll("_", " ")}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Resource details copied to clipboard!");
      }).catch(() => {
        showShareModal();
      });
    } else {
      showShareModal();
    }
  };

  const showShareModal = () => {
    const shareText = `${file.title}\n\n${file.description}\n\nCourse: ${file.course_code}\nAuthor: ${file.user_name.replaceAll("_", " ")}`;
    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Resource details copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return;
    }

    try {
      const data = await deleteResource(file.id);
      if (data.success) {
        // Invalidate and refetch the resources query to update the UI
        queryClient.invalidateQueries({ queryKey: ["resources"] });
        alert("Resource deleted successfully!");
      } else {
        alert("Failed to delete resource: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete resource: " + (err.message || "Unknown error"));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(file.title);
    setEditDescription(file.description);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      alert("Title and description cannot be empty");
      return;
    }

    try {
      const data = await updateResource(file.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      
      if (data.success) {
        // Update the file object with new data
        file.title = editTitle.trim();
        file.description = editDescription.trim();
        setIsEditing(false);
        // Invalidate and refetch the resources query to update the UI
        queryClient.invalidateQueries({ queryKey: ["resources"] });
        alert("Resource updated successfully!");
      } else {
        alert("Failed to update resource: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update resource: " + (err.message || "Unknown error"));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(file.title);
    setEditDescription(file.description);
  };

  // Check if current user is the owner of the resource
  const isOwner = storedUser && file.user_id === storedUser.id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.file-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
        <div className="file-header-right">
          <span className="file-badge">{isPdf ? "PDF" : "IMG"}</span>
          {isOwner && (
            <div className="file-menu">
              <button 
                className="menu-button"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={20} />
              </button>
              {showMenu && (
                <div className="menu-dropdown">
                  <button onClick={handleEdit} className="menu-item">
                    <Edit size={16} />
                    Edit
                  </button>
                  <button onClick={handleDelete} className="menu-item delete">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            className="edit-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Resource title"
          />
          <textarea
            className="edit-description-input"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Resource description"
            rows={3}
          />
          <div className="edit-actions">
            <button onClick={handleSaveEdit} className="save-btn">
              Save
            </button>
            <button onClick={handleCancelEdit} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="file-title">{file.title}</h3>
          <p className="file-description">{file.description}</p>
        </>
      )}

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
          <span  onClick={() => setShowComments((prev) => !prev)} >
            <MessageCircle size={18} /> {comments.length}
          </span>
          <span onClick={handleShare} style={{ cursor: 'pointer' }}>
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
      {showComments && (
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
            <div className="comment-avatar">{initial_user}</div>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleAddComment}>Post</button>
          </div>
        </div>
      )}

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
