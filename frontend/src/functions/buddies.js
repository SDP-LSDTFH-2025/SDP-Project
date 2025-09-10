export async function getUsersFollowers(token,id) {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/followers/`, {
      method: "GET",
      body: JSON.stringify({"token":token,"id":id}),
      headers: { "Content-Type": "application/json" },
    });

    let followers = await res.json();

    if (followers.success) {
      console.log("API Response:", followers);
      return followers["data"];
    } else {
      console.error(`Failed to get followers: ${followers.message || "Unknown error"}`);
      throw new Error(followers.message || "Failed to fetch followers");
    }
  } catch (error) {
    console.error("Followers error:", error);
    throw error; 
  }
}