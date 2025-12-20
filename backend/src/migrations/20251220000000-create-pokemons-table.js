'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pokemons', {
      pokemonId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      generation: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      attack: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      defense: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      speed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      types: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      searchText: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('pokemons', ['name']);
    await queryInterface.addIndex('pokemons', ['generation']);
    await queryInterface.addIndex('pokemons', ['types']);
    await queryInterface.addIndex('pokemons', ['hp']);
    await queryInterface.addIndex('pokemons', ['attack']);
    await queryInterface.addIndex('pokemons', ['defense']);
    await queryInterface.addIndex('pokemons', ['speed']);
    await queryInterface.addIndex('pokemons', ['searchText'], {
      using: 'GIN',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('pokemons');
  }
};