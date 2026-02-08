import { getSequelize } from "@/lib/db";
import User from "./User";
import Task from "./Task";

const sequelize = getSequelize();

// Relations
User.hasMany(Task, { foreignKey: "assignedToId" });
Task.belongsTo(User, {
    foreignKey: "assignedToId",
    as: "assignedTo",
});

export { sequelize, User, Task };
