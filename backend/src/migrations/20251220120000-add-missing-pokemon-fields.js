'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to pokemons table
    await queryInterface.addColumn('pokemons', 'specialAttack', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('pokemons', 'specialDefense', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('pokemons', 'height', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('pokemons', 'weight', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('pokemons', 'abilities', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns
    await queryInterface.removeColumn('pokemons', 'specialAttack');
    await queryInterface.removeColumn('pokemons', 'specialDefense');
    await queryInterface.removeColumn('pokemons', 'height');
    await queryInterface.removeColumn('pokemons', 'weight');
    await queryInterface.removeColumn('pokemons', 'abilities');
  }
};
