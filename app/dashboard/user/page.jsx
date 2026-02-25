"use client";

import { useEffect, useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STATUS = ["pending", "in-progress", "done"];
const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    done: "bg-green-100 text-green-800 border-green-300",
};

export default function UserDashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedDescription, setEditedDescription] = useState("");
    const [userId, setUserId] = useState(null);

    // Get session token
    const getAuthToken = async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token;
    };

    // Load tasks assigned to this user
    const loadTasks = async () => {
        setLoading(true);
        setError("");

        try {
            const token = await getAuthToken();

            if (!token) {
                setError("Unauthorized");
                return;
            }

            const response = await fetch('/api/tasks/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to load tasks");
            }

            setTasks(data.tasks || []);
            setUserId(data.userId);
        } catch (err) {
            console.error(err.message || err);
            setError(err.message || "Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const updateTask = async (taskId, updates) => {
        try {
            const token = await getAuthToken();

            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            const response = await fetch('/api/tasks/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    taskId,
                    updates
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update task");
            }

            // Update local state
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? data.task : t))
            );

            return data.task;
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update task");
            throw err;
        }
    };

    const handleStartEdit = (task) => {
        setEditingTaskId(task.id);
        setEditedDescription(task.description || "");
    };

    const handleSaveEdit = async (taskId) => {
        const currentTask = tasks.find((t) => t.id === taskId);

        if (editedDescription.trim() !== currentTask?.description) {
            try {
                await updateTask(taskId, { description: editedDescription });
            } catch (error) {
                return;
            }
        }
        setEditingTaskId(null);
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditedDescription("");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tasks</h1>
                    <p className="text-gray-600">
                        Manage and track all your tasks assigned to you
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Task Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {STATUS.map((status) => (
                        <div
                            key={status}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
                        >
                            <div className="flex items-center">
                                <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${STATUS_COLORS[status].split(" ")[0]
                                        }`}
                                >
                                    {status === "pending" && "📝"}
                                    {status === "in-progress" && "⚡"}
                                    {status === "done" && "✅"}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 capitalize">{status}</p>
                                    <p className="text-2xl font-bold">
                                        {tasks.filter((t) => t.status === status).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Task Grid */}
                {tasks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            No tasks found
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            All caught up! Enjoy your free time.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
                            >
                                <div className="p-6">
                                    {/* Task Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                                            {task.title}
                                        </h3>
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[task.status]
                                                }`}
                                        >
                                            {task.status.replace("-", " ")}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-black">
                                                Details :
                                            </label>
                                            {editingTaskId !== task.id && (
                                                <button
                                                    onClick={() => handleStartEdit(task)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {editingTaskId === task.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    className="w-full min-h-[120px] border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                                    value={editedDescription}
                                                    onChange={(e) => setEditedDescription(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(task.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                    >
                                                        <Check className="w-4 h-4" /> Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                                    >
                                                        <X className="w-4 h-4" /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-700 text-sm">
                                                {task.description || (
                                                    <p className="text-gray-400 italic">No description added</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Control */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <div className="flex gap-2">
                                            {STATUS.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateTask(task.id, { status })}
                                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${task.status === status
                                                        ? `${STATUS_COLORS[status]} border-2`
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                                        }`}
                                                >
                                                    {status === "in-progress" ? "In Progress" : status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}