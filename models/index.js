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

// Sync DB
export const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected");

        await sequelize.sync({ alter: true });
        console.log("Models Synced");
    } catch (error) {
        console.error("DB Error:", error);
    }
};

export { User, Task };
