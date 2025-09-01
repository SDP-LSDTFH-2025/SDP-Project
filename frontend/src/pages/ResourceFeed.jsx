import React from 'react';
import { Upload } from 'lucide-react'; // Assuming lucide-react for icons
import './ResourceFeed.css';

const ResourceFeed = ({
  activeView,
  fileInputRef,
  handleFileSelect,
  handleUploadClick,
  handleUploadSubmit,
  title,
  setTitle,
  courseId,
  setCourseId,
  description,
  setDescription,
  error,
  onFilesSelected
}) => {
  return (
    <section className="resources">
      <div className="col-span-6">
        {activeView === 'feed' && (
          <div className="share-card">
            <h2>Share a thought...</h2>
            <input
              className="search"
              placeholder="What would you like to share with your buddies?"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden-file-input"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf"
            />
            <button className="upload-btn" onClick={handleUploadClick}>
              <Upload className="pics" /> Upload
            </button>
          </div>
        )}

        {activeView === 'upload' && (
          <div id="Uploads" className="share-card">
            <h2>Upload Study Resource</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleUploadSubmit}>
              <input
                className="search"
                placeholder="Resource title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="search"
                placeholder="Course Code"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              />
              <input
                className="search"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="drag-drop-area">
                <DragAndDropArea onFilesSelected={onFilesSelected} />
              </div>
              <button type="submit" className="upload-btn">
                Submit Upload
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResourceFeed;