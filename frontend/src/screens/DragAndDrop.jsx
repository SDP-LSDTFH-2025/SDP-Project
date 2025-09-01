import React, { useState } from "react";
import { Upload } from "lucide-react";
import "./DragAndDrop.css";

export function DragAndDropArea({ onFilesSelected }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    if (onFilesSelected) onFilesSelected(droppedFiles);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    if (onFilesSelected) onFilesSelected(selectedFiles);
  };

  return (
    <div
      className={`drag-area ${dragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload></Upload>
      <p>Drag and drop your files here, or click to browse</p>
      <input
        id="fileUpload"
        type="file"
        multiple
        onChange={handleFileChange}
        className="file-input"
      />
      <label htmlFor="fileUpload" className="custom-upload-btn">
        Choose Files
      </label>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <li key={i}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
