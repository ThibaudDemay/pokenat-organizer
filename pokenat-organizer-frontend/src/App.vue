<template>
  <div id="container">
    <Header
      :languages="languages"
      :selectedLanguage="selectedLanguage"
      @select-language="selectLanguage"
    />

    <template v-if="loading">
      <div class="flex-1 flex items-center justify-center">
        <span class="text-gray-500">Chargement du Pokédex...</span>
      </div>
    </template>

    <template v-else-if="error">
      <div class="flex-1 flex flex-col items-center justify-center gap-4">
        <span class="text-red-500">{{ error }}</span>
        <button @click="loadData" class="px-4 py-2 bg-red-600 text-white rounded">
          Réessayer
        </button>
      </div>
    </template>

    <template v-else>
      <div id="main-content">
        <div id="left-panel">
          <PokedexSelector
            :pokedexes="pokedexes"
            :selectedPokedex="selectedPokedex"
            :lang="selectedLanguage"
            @select-pokedex="selectPokedex"
          />
          <SearchBar
            :index="searchIndex"
            :pokedex="filteredPokedex"
            :selectedPokedex="selectedPokedex"
            :lang="selectedLanguage"
            @select-pokemon="selectPokemon"
          />
          <Organizer
            :pokemon="selectedPokemon"
            :pokedex="filteredPokedex"
            :selectedPokedex="selectedPokedex"
            :lang="selectedLanguage"
            @select-pokemon="selectPokemon"
          />
        </div>
        <aside id="right-panel">
          <PokemonDetails
            :pokemon="selectedPokemon"
            :selectedPokedex="selectedPokedex"
            :lang="selectedLanguage"
          />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Pokemon, PokedexInfo } from '@/models/pokemon.model';
import LocalDataService from '@/services/LocalData.service';
import Header from '@/components/Header.vue';
import PokedexSelector from '@/components/PokedexSelector.vue';
import SearchBar from '@/components/SearchBar.vue';
import Organizer from '@/components/Organizer.vue';
import PokemonDetails from '@/components/PokemonDetails.vue';

interface SearchIndexEntry {
  id: string;
  name: string;
}

const languages = ref<string[]>([]);
const searchIndex = ref<SearchIndexEntry[]>([]);
const pokedex = ref<Pokemon[]>([]);
const pokedexes = ref<Record<string, PokedexInfo>>({});
const selectedLanguage = ref('en');
const selectedPokedex = ref('national');
const selectedPokemon = ref<Pokemon | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Pokémon filtrés et triés selon le pokédex sélectionné
const filteredPokedex = computed(() => {
  const dexName = selectedPokedex.value;

  // Filtre: garde uniquement les Pokémon présents dans ce pokédex
  const filtered = pokedex.value.filter(p => p.pokedex[dexName] !== undefined);

  // Tri: par numéro dans ce pokédex
  return filtered.sort((a, b) => {
    return Number(a.pokedex[dexName]) - Number(b.pokedex[dexName]);
  });
});

function initPreferences() {
  const savedLang = localStorage.getItem('language');
  if (savedLang) {
    selectedLanguage.value = savedLang;
  }
  const savedPokedex = localStorage.getItem('pokedex');
  if (savedPokedex) {
    selectedPokedex.value = savedPokedex;
  }
}

async function loadData() {
  loading.value = true;
  error.value = null;

  try {
    const [langResponse, indexResponse, pokedexResponse, pokedexesResponse] = await Promise.all([
      LocalDataService.getLanguage(),
      LocalDataService.getIndex(),
      LocalDataService.getPokedex(),
      LocalDataService.getPokedexes()
    ]);

    languages.value = langResponse.data;

    searchIndex.value = Object.entries(indexResponse.data).map(
      ([name, id]) => ({ id: id as string, name })
    );

    pokedex.value = Object.values(pokedexResponse.data).map(p => ({
      ...p,
      id: Number(p.id)
    }));

    pokedexes.value = pokedexesResponse.data;

  } catch (e) {
    error.value = 'Impossible de charger les données. Vérifiez votre connexion.';
    console.error('Failed to load data:', e);
  } finally {
    loading.value = false;
  }
}

function selectLanguage(lang: string) {
  localStorage.setItem('language', lang);
  selectedLanguage.value = lang;
}

function selectPokedex(dex: string) {
  localStorage.setItem('pokedex', dex);
  selectedPokedex.value = dex;
  selectedPokemon.value = null; // Reset selection when changing pokedex
}

function selectPokemon(pokemon: Pokemon) {
  selectedPokemon.value = pokemon;
}

onMounted(() => {
  initPreferences();
  loadData();
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  @apply transition-colors duration-200;
}

#container {
  @apply mx-auto;
  @apply flex flex-col h-screen;

  // Mobile: max-width pour le contenu
  @apply max-w-2xl;

  // Desktop: pleine largeur avec padding
  @screen lg {
    @apply max-w-full px-4;
  }
}

#main-content {
  @apply flex flex-col flex-1 overflow-hidden;

  // Desktop: layout horizontal
  @screen lg {
    @apply flex-row gap-4;
  }

  #left-panel {
    @apply flex flex-col flex-1 overflow-hidden;

    @screen lg {
      @apply max-w-2xl;
    }
  }

  #right-panel {
    // Mobile: caché par défaut
    @apply hidden;

    // Desktop: panneau latéral visible
    @screen lg {
      @apply block w-80 flex-shrink-0;
      @apply overflow-y-auto p-2;
    }
  }
}
</style>
