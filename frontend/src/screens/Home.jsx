import React from "react";
import "./Home.css";



function Home({ user }){
  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };
  const friends = user?.friends || [];
  const groups = user?.groups || [];
  const resources = user?.resources || [];
  return (

    <main className="dashboard">
      {/* Navigation (left sidebar) */}
      <aside className="sidebar">
        <h2>Navigation</h2>
        <ul>
          <li>Resource Feed</li>
          <li>Study Groups</li>
          <li>Friend Requests</li>
          <li>Upload Resource</li>
        </ul>
      </aside>


      {/* Resource feed (center) */}
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

      {/* Right sidebar */}
      <aside className="rightbar">
        {/* Study buddies */}
        <div className="study-buddies">
          <h3>Study Buddies</h3>
          {friends.length > 0 ? (
            friends.map((f, i) => (
              <p key={i}>
                {f.name} – {f.status}
              </p>
            ))
          ) : (
            <p className="empty-text">No friends yet.</p>
          )}
        </div>

        {/* Active study groups */}
        <div className="study-groups">
          <h3>Active Study Groups</h3>
          {groups.length > 0 ? (
            groups.map((g, i) => (
              <p key={i}>
                {g.name} ({g.online} online)
              </p>
            ))
          ) : (
            <p className="empty-text">No groups yet.</p>
          )}
        </div>
      </aside>
      <section>
        <button
          onClick={logout}
          style={{
            color: "red",
            border: "1px solid gray",
            backgroundColor: "white",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </section>
    </main>
  );
};

export default Home;