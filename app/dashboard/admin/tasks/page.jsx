"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Plus, Trash2, Users, Search, Filter, X } from "lucide-react";

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Load tasks & users
    const loadData = async () => {
        const t = await fetchAPI("/api/tasks/list");
        const u = await fetchAPI("/api/users");
        setTasks(t.tasks || []);
        setUsers(u.users || []);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Create task
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetchAPI("/api/tasks/create", "POST", {
            title,
            description,
            assignedToId: assignedToId || null,
        });

        if (!res.task) {
            setError(res.message || "Failed to create task");
        } else {
            setTitle("");
            setDescription("");
            setAssignedToId("");
            setTasks(prev => [res.task, ...prev]);
        }

        setLoading(false);
    };

    // Assign task
    const handleAssign = async (taskId, userId) => {
        const parsedUserId = userId ? Number(userId) : null;

        const userToAssign = users.find(
            user => user.id === parsedUserId
        );

        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        assignedTo: userToAssign || null,
                        assignedToId: parsedUserId,
                    }
                    : task
            )
        );

        await fetchAPI("/api/tasks/assign-task", "PATCH", {
            taskId,
            assignedToId: parsedUserId,
        });
    };

    // Open delete confirmation modal
    const openDeleteModal = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTaskToDelete(null);
    };

    // Delete task
    const handleDelete = async () => {
        if (!taskToDelete) return;

        // Optimistic update: immediately remove from UI
        setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
        closeDeleteModal();

        // Then make API call
        await fetchAPI(`/api/tasks/delete`, "DELETE", {
            taskId: taskToDelete.id,
        });
    };

    // Filter and search tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === "all" || task.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'done': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && taskToDelete && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                                <p className="text-sm text-gray-600 mt-1">Are you sure you want to delete this task?</p>
                            </div>
                            <button
                                onClick={closeDeleteModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="font-medium text-gray-900">{taskToDelete.title}</div>
                            {taskToDelete.description && (
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {taskToDelete.description}
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(taskToDelete.status)}`}>
                                    {taskToDelete.status.replace('-', ' ')}
                                </span>
                                {taskToDelete.assignedTo && (
                                    <span className="text-xs text-gray-500">
                                        Assigned to: {taskToDelete.assignedTo.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
                    <p className="text-gray-600 mt-1">Create and manage tasks for users</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {tasks.length} tasks
                </div>
            </div>

            {/* Create Task Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Title *
                            </label>
                            <input
                                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Enter task title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assign To
                            </label>
                            <select
                                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value)}
                            >
                                <option value="">Not assigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[80px]"
                            placeholder="Task description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-300">
                        <button
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            {loading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300">
                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-300">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-black border border-gray-300 rounded-lg">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    className="outline-none bg-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-700">Task</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Assigned To</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="border-t border-gray-300 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{task.title}</div>
                                            {task.description && (
                                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {task.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                                            {task.status.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {task.assignedTo ? (
                                                <>
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{task.assignedTo.name}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <select
                                                className="px-3 py-1.5 text-black border border-gray-300 rounded-lg text-sm
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                value={task.assignedToId ?? ""}
                                                onChange={(e) => handleAssign(task.id, e.target.value)}
                                            >
                                                <option value="">Assign...</option>
                                                {users.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => openDeleteModal(task.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete task"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredTasks.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium mb-2">No tasks found</p>
                                            <p className="text-gray-400">
                                                {search || filterStatus !== "all"
                                                    ? "Try adjusting your search or filter"
                                                    : "Create your first task to get started"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}