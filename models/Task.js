// models/Task.js
import { DataTypes } from "sequelize";
import { getSequelize } from "@/lib/db";
const sequelize = getSequelize();


const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM("pending", "in-progress", "done"),
        defaultValue: "pending",
    },
    assignedToId: { type: DataTypes.INTEGER, allowNull: true }
});

export default Task;
