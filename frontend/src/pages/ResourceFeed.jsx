export default function ResourceFeed({ resources }) {
  return (
    <section className="resources">
      <h2>Share a Resource</h2>
      <button className="upload-btn">Upload</button>
      <input placeholder="What would you like to share?" />

      {resources.length > 0 ? (
        resources.map((res, i) => (
          <div key={i} className="resource-card">
            <h3>{res.title}</h3>
            <p>{res.description}</p>
          </div>
        ))
      ) : (
        <p className="empty-text">No resources posted yet.</p>
      )}
    </section>
  );
}
