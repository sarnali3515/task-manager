export const fetchAPI = async (url, method = "GET", data = null) => {
    try {
        // Check if we're in browser environment
        let token = null;
        if (typeof window !== "undefined") {
            token = localStorage.getItem("token");
        }

        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...(data && { body: JSON.stringify(data) }),
        };

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds
        options.signal = controller.signal;

        const res = await fetch(url, options);
        clearTimeout(timeoutId);

        let result = null;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        }
        if (!res.ok) {
            // Handle specific status codes
            if (res.status === 401) {
                // Token expired or invalid
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("userId");
                    //  Redirect to login
                    window.location.href = "/login";
                }
            }
            if (res.status === 403) {

                return { forbidden: true };
            }

            throw new Error(
                result?.message || `HTTP ${res.status}: ${res.statusText}`
            );
        }

        return result;
    } catch (error) {
        console.error("Fetch API Error:", error);

        // Handle specific errors
        if (error.name === "AbortError") {
            throw new Error("Request timeout. Please try again.");
        }

        if (error.name === "TypeError" && error.message === "Failed to fetch") {
            throw new Error("Network error. Please check your connection.");
        }

        throw error;
    }
};