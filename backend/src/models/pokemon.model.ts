import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define the attributes for the Pokemon model
interface PokemonAttributes {
  pokemonId: number;
  name: string;
  generation: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  searchText: string;
}

// Define the creation attributes (some fields may be optional during creation)
interface PokemonCreationAttributes extends Optional<PokemonAttributes, 'pokemonId'> {}

// Define the Pokemon model class
class Pokemon extends Model<PokemonAttributes, PokemonCreationAttributes> implements PokemonAttributes {
  public pokemonId!: number;
  public name!: string;
  public generation!: number;
  public hp!: number;
  public attack!: number;
  public defense!: number;
  public specialAttack!: number;
  public specialDefense!: number;
  public speed!: number;
  public height!: number;
  public weight!: number;
  public types!: string[];
  public abilities!: string[];
  public searchText!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Pokemon model
Pokemon.init(
  {
    pokemonId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    generation: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attack: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    defense: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    specialAttack: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    specialDefense: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    abilities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    searchText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Pokemon',
    tableName: 'pokemons',
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['generation'],
      },
      {
        fields: ['types'],
      },
      {
        fields: ['hp'],
      },
      {
        fields: ['attack'],
      },
      {
        fields: ['defense'],
      },
      {
        fields: ['speed'],
      },
    ],
  }
);

export default Pokemon;