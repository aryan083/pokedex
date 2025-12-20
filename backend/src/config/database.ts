import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Use DATABASE_URL if provided (Render format), otherwise use individual variables
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    })
  : new Sequelize(
      process.env.DB_NAME || "pokedex",
      process.env.DB_USER || "postgres",
      process.env.DB_PASS || "postgres",
      {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        dialect: "postgres" as const,
        logging: process.env.NODE_ENV === "development" ? console.log : false,
      }
    );

export { sequelize };
