"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable pgvector extension
    await queryInterface.sequelize.query(
      "CREATE EXTENSION IF NOT EXISTS vector;"
    );

    // Add vector columns to pokemons table
    await queryInterface.addColumn("pokemons", "nameEmbedding", {
      type: "vector(384)", // Using 384-dimensional embeddings (sentence-transformers/all-MiniLM-L6-v2)
      allowNull: true,
      comment: "Vector embedding for Pokemon name",
    });

    await queryInterface.addColumn("pokemons", "typeEmbedding", {
      type: "vector(384)",
      allowNull: true,
      comment: "Vector embedding for Pokemon types",
    });

    await queryInterface.addColumn("pokemons", "descriptionEmbedding", {
      type: "vector(384)",
      allowNull: true,
      comment: "Vector embedding for Pokemon description/characteristics",
    });

    await queryInterface.addColumn("pokemons", "combinedEmbedding", {
      type: "vector(384)",
      allowNull: true,
      comment: "Combined vector embedding for comprehensive search",
    });

    // Create vector similarity indexes for fast nearest neighbor search
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS pokemons_name_embedding_cosine_idx 
      ON pokemons USING ivfflat (nameEmbedding vector_cosine_ops) 
      WITH (lists = 100);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS pokemons_type_embedding_cosine_idx 
      ON pokemons USING ivfflat (typeEmbedding vector_cosine_ops) 
      WITH (lists = 100);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS pokemons_description_embedding_cosine_idx 
      ON pokemons USING ivfflat (descriptionEmbedding vector_cosine_ops) 
      WITH (lists = 100);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS pokemons_combined_embedding_cosine_idx 
      ON pokemons USING ivfflat (combinedEmbedding vector_cosine_ops) 
      WITH (lists = 100);
    `);

    // Create function for hybrid search scoring
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION calculate_hybrid_score(
        vector_similarity FLOAT,
        text_similarity FLOAT,
        vector_weight FLOAT DEFAULT 0.7,
        text_weight FLOAT DEFAULT 0.3
      ) RETURNS FLOAT AS $$
      BEGIN
        RETURN (vector_similarity * vector_weight) + (text_similarity * text_weight);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop function
    await queryInterface.sequelize.query(
      "DROP FUNCTION IF EXISTS calculate_hybrid_score;"
    );

    // Drop indexes
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS pokemons_combined_embedding_cosine_idx;"
    );
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS pokemons_description_embedding_cosine_idx;"
    );
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS pokemons_type_embedding_cosine_idx;"
    );
    await queryInterface.sequelize.query(
      "DROP INDEX IF EXISTS pokemons_name_embedding_cosine_idx;"
    );

    // Remove vector columns
    await queryInterface.removeColumn("pokemons", "combinedEmbedding");
    await queryInterface.removeColumn("pokemons", "descriptionEmbedding");
    await queryInterface.removeColumn("pokemons", "typeEmbedding");
    await queryInterface.removeColumn("pokemons", "nameEmbedding");

    // Note: We don't drop the vector extension as it might be used by other tables
  },
};
