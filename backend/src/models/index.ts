import { sequelize } from '../config/database';
import Pokemon from './pokemon.model';

// Sync all models with the database
const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize, Pokemon, syncDatabase };