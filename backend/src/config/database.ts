import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const config = {
  database: process.env.DB_NAME || "pokedex",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  dialect: "postgres" as const,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
};

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);
