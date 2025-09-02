export async function getAllGroups() {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/study_groups`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let groups = await res.json();

    if (groups.message) {
      // console.log("API Response:", groups);
      return groups["groups"];
    } else {
      console.error(`Failed to get groups: ${groups.message || "Unknown error"}`);
      throw new Error(groups.message || "Failed to fetch groups");
    }
  } catch (error) {
    console.error("Group error:", error);
    throw error; 
  }
}