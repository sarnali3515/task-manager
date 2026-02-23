import { Sequelize } from "sequelize";

let sequelize;

export const getSequelize = () => {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: "postgres",
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
            logging: console.log,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        });
    }

    return sequelize;
};

export const testConnection = async () => {
    try {
        const sequelize = getSequelize();
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
};