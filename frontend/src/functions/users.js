/**
 * Fetches all users from the server.
 * @async
 * @function getAllUsers
 * @returns {Promise<Object[]>} A promise that resolves to an array of user objects if the request is successful.
 * @throws {Error} If the request fails or the server returns an error.
 * @example
 * getAllUsers()
 *   .then(users => console.log("Users:", users))
 *   .catch(error => console.error("Error:", error));
 */
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

/**
 * Fetches a single user by their ID from the server.
 * @async
 * @function getUser
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<Object>} A promise that resolves to the user object if the request is successful.
 * @throws {Error} If the request fails, the userId is invalid, or the server returns an error.
 * @example
 * getUser("12345")
 *   .then(user => console.log("User:", user))
 *   .catch(error => console.error("Error:", error));
 */
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

/**
 * Registers a new user with the provided data.
 * @async
 * @function regUser
 * @param {Object} userData - The user data to register.
 * @param {string} userData.google_id - The user's Google ID.
 * @param {string} userData.course - The user's course of study.
 * @param {string} userData.year_of_study - The user's year of study.
 * @param {string} userData.academic_interests - The user's academic interests.
 * @param {string} userData.study_preferences - The user's study preferences.
 * @param {string} userData.institution - The user's institution.
 * @param {string} userData.school - The user's school.
 * @returns {Promise<Object>} A promise that resolves to the registered user object if the request is successful.
 * @throws {Error} If the request fails or the server returns an error.
 * @example
 * const userData = {
 *   google_id: "12345",
 *   course: "Computer Science",
 *   year_of_study: "2nd",
 *   academic_interests: "AI, Machine Learning",
 *   study_preferences: "Group study",
 *   institution: "Example University",
 *   school: "Engineering"
 * };
 * regUser(userData)
 *   .then(user => console.log("Registered user:", user))
 *   .catch(error => console.error("Error:", error));
 */
export async function regUser(userData) {
  try {
    const SERVER = import.meta.env.VITE_PROD_SERVER || import.meta.env.VITE_DEV_SERVER;
    let res = await fetch(`${SERVER}/api/v1/users/register`, {
      method: "POST",
      body: JSON.stringify(userData),
      headers: { "Content-Type": "application/json" },
    });

    let user = await res.json();

    if (user.success) {
      console.log("API Response:", user);
      return user.data;
    } else {
      console.error(`Failed to register user: ${user.message || "Unknown error"}`);
      throw new Error(user.message || "Failed to register user");
    }
  } catch (error) {
    console.error("User registration error:", error);
    throw error;
  }
}