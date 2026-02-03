import { Sequelize } from "sequelize";

let sequelize;

export const getSequelize = () => {
    if (!sequelize) {
        sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: "mysql",
                dialectModule: require("mysql2"),
                logging: false,
            }
        );
    }

    return sequelize;
};
