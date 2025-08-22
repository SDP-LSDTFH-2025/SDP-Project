import React from "react";

function Home({ user }){
  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };
  return (
    <main style={{ textAlign: "center", margin: "3rem" }}>
      <h1>Dear {user?.username}</h1>

      <p>
        You are viewing this page because you are logged in or you just signed
        up
      </p>

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