import { sequelize } from "./models";

export async function register() {
    console.log("Server starting..");

    try {
        await sequelize.authenticate();

        await sequelize.sync({
            alter: true, // dev only
        });

        console.log("Database initialized");
    } catch (err) {
        console.error("DB init failed:", err.message);
    }
}
