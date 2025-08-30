export async function getUsersCourses(userId) {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/user-courses/user/${userId}` , {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let courses = await res.json();

    if (courses.success) {
      console.log("API Response:", courses);
      return courses["data"];
    } else {
      console.error(`Failed to get courses: ${courses.message || "Unknown error"}`);
      throw new Error(courses.message || "Failed to fetch user's courses");
    }
  } catch (error) {
    console.error("Courses error:", error);
    throw error; 
  }
}