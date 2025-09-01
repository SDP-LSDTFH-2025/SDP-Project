import React from "react";
import "./FriendList.css";

function FriendList({ friends }) {

  // logic
  
  return (
    <div className="study-buddies">
      <h3>Study Buddies</h3>
      {friends && friends.length > 0 ? (
        friends.map((f, i) => (
          <p key={i}>
            {f.name} – <span className={f.status}>{f.status}</span>
          </p>
        ))
      ) : (
        <p className="empty-text">No friends yet.</p>
      )}
    </div>
  );
}

export default FriendList;
