export const fetchAPI = async (url, method = "GET", data = null) => {
    const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...(data && { body: JSON.stringify(data) }),
    });

    let result = null;

    try {
        result = await res.json();
    } catch {
        // Response has no JSON body
    }

    if (!res.ok) {
        if (res.status === 401) {
            console.warn("Unauthorized API call:", url);
            throw new Error("Unauthorized");
        }

        throw new Error(result?.message || "Something went wrong");
    }

    return result;
};
