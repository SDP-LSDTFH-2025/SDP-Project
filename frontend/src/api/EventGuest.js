// Add, update, and retrieve guest details and RSVP status.
const SERVER = import.meta.env.MODE === "development" ? import.meta.env.VITE_DEV_SERVER || "http://localhost:3000" : import.meta.env.VITE_PROD_SERVER;
const url = `${SERVER}/api/v1/`; // Base URL for the API

export function getGuests(eventId) {
    return fetch(`${url}planit/guests/event/${eventId}`, {
        headers: {
            'user_id': JSON.parse(localStorage.getItem("user") || "{}").id || "",
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    // For 404s, return empty array instead of throwing error
                    console.log("No guests found for event:", eventId);
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check if response has content before trying to parse JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.log("Response is not JSON, returning empty array");
                return [];
            }
            
            return response.json();
        })
        .then(data => {
            // Handle our consistent response structure
            if (data.success && Array.isArray(data.data)) {
                return data.data;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                console.warn("Unexpected response structure:", data);
                return [];
            }
        })
        .catch(error => {
            console.error("Error fetching guests:", error);
            // Return empty array on any error to prevent app crashes
            return [];
        });
}

export function addGuest(eventId, guest) {
    return fetch(`${url}planit/guests/event/${eventId}`, {
        method: 'POST',
        headers: {
            'user_id': JSON.parse(localStorage.getItem("user") || "{}").id || "",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(guest),
    })
        .then(response => {
            if (!response.ok) {
                // Try to parse error response, but handle non-JSON responses
                return response.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.error || errorData.message || 'Network response was not ok');
                    } catch (parseError) {
                        throw new Error(text || 'Network response was not ok');
                    }
                });
            }
            
            // Check if response has content before trying to parse JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            
            return response.json();
        })
        .then(data => {
            // Handle our consistent response structure
            if (data.success) {
                return data.data;
            } else {
                // Extract error message from nested structure
                let errorMessage = 'Failed to add guest';
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.details && data.details.error) {
                    errorMessage = data.details.error;
                } else if (data.details && data.details.message) {
                    errorMessage = data.details.message;
                }
                throw new Error(errorMessage);
            }
        });
}

export function updateGuest(eventId, guestId, guest) {
    return fetch(`${url}planit/guests/event/${eventId}/guest/${guestId}`, {
        method: 'PATCH',
        headers: { 
            'user_id': JSON.parse(localStorage.getItem("user") || "{}").id || "",
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(guest),
    })
        .then(response => {
            if (!response.ok) {
                // Try to parse error response, but handle non-JSON responses
                return response.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.error || errorData.message || 'Failed to update guest');
                    } catch (parseError) {
                        throw new Error(text || 'Failed to update guest');
                    }
                });
            }
            
            // Check if response has content before trying to parse JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
            
            return response.json();
        })
        .then(data => {
            // Handle our consistent response structure
            if (data.success) {
                return data.data;
            } else {
                // Extract error message from nested structure
                let errorMessage = 'Failed to update guest';
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.details && data.details.error) {
                    errorMessage = data.details.error;
                } else if (data.details && data.details.message) {
                    errorMessage = data.details.message;
                }
                throw new Error(errorMessage);
            }
        });
}

export async function deleteGuest(eventId, guestId) {
    const response = await fetch(`${url}planit/guests/event/${eventId}/guest/${guestId}`, {
        method: 'DELETE',
        headers: {
            'user_id': JSON.parse(localStorage.getItem("user") || "{}").id || "",
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Try to parse error response, but handle non-JSON responses
        const text = await response.text();
        try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || errorData.message || `Failed to delete guest: ${response.statusText}`);
        } catch (parseError) {
            throw new Error(text || `Failed to delete guest: ${response.statusText}`);
        }
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return { success: true, data: null };
    }

    const data = await response.json();
    
    // Handle our consistent response structure
    if (data.success) {
        return { success: true, data: data.data };
    } else {
        // Extract error message from nested structure
        let errorMessage = 'Failed to delete guest';
        if (data.error) {
            errorMessage = data.error;
        } else if (data.details && data.details.error) {
            errorMessage = data.details.error;
        } else if (data.details && data.details.message) {
            errorMessage = data.details.message;
        }
        throw new Error(errorMessage);
    }
}

export default { getGuests, addGuest, updateGuest, deleteGuest };
