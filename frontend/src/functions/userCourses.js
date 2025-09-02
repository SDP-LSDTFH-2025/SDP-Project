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

export async function getCourseEnrolls(courseId) {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/user-courses/course/${courseId}` , {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let users = await res.json();

    if (users.success) {
      console.log("API Response:", users);
      return users["data"];
    } else {
      console.error(`Failed to get users in course: ${users.message || "Unknown error"}`);
      throw new Error(users.message || "Failed to fetch user's in course");
    }
  } catch (error) {
    console.error("Courses-enrolls error:", error);
    throw error; 
  }
}