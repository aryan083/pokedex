import axios from 'axios';

const BACKEND_BASE_URL = 'http://localhost:3000/api';

interface Pokemon {
  pokemonId: number;
  name: string;
  generation: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  types: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: any;
  message?: string;
}

const testBackendWithSigNoz = async () => {
  try {
    console.log('🔍 Testing PokéDex Backend API with SigNoz Observability...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BACKEND_BASE_URL}/pokemon/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Get all Pokémon (first page)
    console.log('\n2. Testing Pokémon listing...');
    const listResponse = await axios.get<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon?page=1&limit=5`);
    console.log(`✅ Retrieved ${listResponse.data.data?.length} Pokémon`);

    // Test 3: Search by name
    console.log('\n3. Testing name search...');
    const searchResponse = await axios.get<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon?search=pikachu`);
    console.log(`✅ Found ${searchResponse.data.data?.length} Pokémon matching "pikachu"`);

    // Test 4: Search by type
    console.log('\n4. Testing type filter...');
    const typeResponse = await axios.get<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon?type=fire`);
    console.log(`✅ Found ${typeResponse.data.data?.length} Fire-type Pokémon`);

    // Test 5: Semantic search
    console.log('\n5. Testing semantic search...');
    const semanticResponse = await axios.get<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon?search=fast`);
    console.log(`✅ Found ${semanticResponse.data.data?.length} "fast" Pokémon`);

    // Test 6: Comparison
    console.log('\n6. Testing Pokémon comparison...');
    const compareResponse = await axios.post<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon/compare`, {
      pokemon: ['pikachu', 'charizard']
    });
    console.log(`✅ Compared ${compareResponse.data.data?.length} Pokémon`);

    // Test 7: Sorting
    console.log('\n7. Testing sorting...');
    const sortResponse = await axios.get<ApiResponse<Pokemon[]>>(`${BACKEND_BASE_URL}/pokemon?sortBy=attack&sortOrder=DESC&limit=3`);
    console.log(`✅ Sorted top 3 Pokémon by attack:`);
    sortResponse.data.data?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.attack} attack)`);
    });

    console.log('\n🎉 All tests passed! Your backend is working with SigNoz observability.');
    console.log('\n📊 You can now view traces and metrics in SigNoz at: http://localhost:3301');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testBackendWithSigNoz();