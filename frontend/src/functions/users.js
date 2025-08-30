export async function getAllUsers() {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let users = await res.json();

    if (users.success) {
      console.log("API Response:", users);
      return users["data"];
    } else {
      console.error(`Failed to get users: ${users.message || "Unknown error"}`);
      throw new Error(users.message || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Users error:", error);
    throw error; 
  }
}

export async function getUser(userId) {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let user = await res.json();

    if (user.success) {
      console.log("API Response:", user);
      return user["data"];
    } else {
      console.error(`Failed to get user${userId}: ${user.message || "Unknown error"}`);
      throw new Error(user.message || "Failed to fetch user");
    }
  } catch (error) {
    console.error("User error:", error);
    throw error; 
  }
}