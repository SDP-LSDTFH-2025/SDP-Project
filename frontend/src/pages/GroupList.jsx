import React from "react";
import "./GroupList.css";

function GroupList({ groups }) {

  //logic

  return (
    <div className="study-groups">
      <h3>Active Study Groups</h3>
      {groups && groups.length > 0 ? (
        groups.map((g, i) => (
          <p key={i}>
            {g.name} ({g.online} online)
          </p>
        ))
      ) : (
        <p className="empty-text">No groups yet.</p>
      )}
    </div>
  );
}

export default GroupList;
