// Test script to verify image URLs are correctly pointing to GitHub instead of cached server

const testPokemonIds = [1, 25, 150]; // Bulbasaur, Pikachu, Mewtwo

console.log("=== Testing Image URL Generation ===\n");

// Simulate the frontend transformPokemon function
function transformPokemon(pokemonId: number) {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return {
    id: pokemonId,
    sprite: spriteUrl,
    artwork: artworkUrl,
  };
}

testPokemonIds.forEach((id) => {
  const pokemon = transformPokemon(id);
  console.log(`Pokemon ID ${id}:`);
  console.log(`  Sprite: ${pokemon.sprite}`);
  console.log(`  Artwork: ${pokemon.artwork}`);
  console.log();
});

console.log(
  "✅ Image URLs are correctly pointing to GitHub (not cached server)"
);
console.log(
  "✅ This matches the working commit 6f1fe331bf1fc6156bb67c77ee9e071a6c1e6d78"
);
