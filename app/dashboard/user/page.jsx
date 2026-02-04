"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Edit2, Check, X } from "lucide-react";

const STATUS = ["pending", "in-progress", "done"];
const STATUS_COLORS = {
    "pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    "done": "bg-green-100 text-green-800 border-green-300"
};

export default function UserDashboard() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Track which task is being edited
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedDescription, setEditedDescription] = useState("");

    const loadTasks = async () => {
        setLoading(true);
        setError("");

        const res = await fetchAPI("/api/tasks/list");

        if (!res.tasks) {
            setError(res.message || "Failed to load tasks");
            setTasks([]);
        } else {
            setTasks(res.tasks);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const updateTask = async (taskId, payload) => {
        const res = await fetchAPI("/api/tasks/update", "PATCH", {
            taskId,
            ...payload,
        });

        if (!res.task) {
            alert(res.message || "Update failed");
        } else {
            loadTasks();
        }
    };

    const handleStartEdit = (task) => {
        setEditingTaskId(task.id);
        setEditedDescription(task.description || "");
    };

    const handleSaveEdit = async (taskId) => {
        if (editedDescription.trim() !== tasks.find(t => t.id === taskId)?.description) {
            await updateTask(taskId, { description: editedDescription });
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tasks</h1>
                    <p className="text-gray-600">
                        Manage and track all your tasks in one place
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Task Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mr-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold">
                                    {tasks.filter(t => t.status === "pending").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In Progress</p>
                                <p className="text-2xl font-bold">
                                    {tasks.filter(t => t.status === "in-progress").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold">
                                    {tasks.filter(t => t.status === "done").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Grid */}
                {tasks.length === 0 && !error ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            No tasks found
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            All caught up! Enjoy your free time or create new tasks to get started.
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
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                                                {task.title}
                                            </h3>

                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[task.status]}`}>
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
                                                    title="Edit description"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {editingTaskId === task.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    className="w-full min-h-[120px] border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                                    placeholder="Add or update task description..."
                                                    value={editedDescription}
                                                    onChange={(e) => setEditedDescription(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(task.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-700 text-sm">
                                                {task.description ? (
                                                    <p className="whitespace-pre-wrap">{task.description}</p>
                                                ) : (
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