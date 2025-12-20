import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Debug logging to see what environment variables are available
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '[REDACTED]' : 'undefined');

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
