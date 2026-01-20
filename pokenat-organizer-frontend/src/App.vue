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
            :versionGroups="versionGroups"
          />
        </aside>
      </div>

      <!-- Mobile Drawer pour les détails -->
      <MobileDrawer :isOpen="isMobileDrawerOpen" @close="closeMobileDrawer">
        <PokemonDetails
          :pokemon="selectedPokemon"
          :selectedPokedex="selectedPokedex"
          :lang="selectedLanguage"
          :versionGroups="versionGroups"
        />
      </MobileDrawer>
    </template>

    <footer>
      <span>Data provided by <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a></span>
      <span class="separator">•</span>
      <a href="https://github.com/thibauddemay/pokenat-organizer" target="_blank" rel="noopener">
        <svg class="inline-block w-4 h-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Pokemon, PokedexInfo, VersionGroup } from '@/models/pokemon.model';
import LocalDataService from '@/services/LocalData.service';
import Analytics from '@/services/Analytics.service';
import Header from '@/components/Header.vue';
import PokedexSelector from '@/components/PokedexSelector.vue';
import SearchBar from '@/components/SearchBar.vue';
import Organizer from '@/components/Organizer.vue';
import PokemonDetails from '@/components/PokemonDetails.vue';
import MobileDrawer from '@/components/MobileDrawer.vue';

interface SearchIndexEntry {
  id: string;
  name: string;
}

const languages = ref<string[]>([]);
const searchIndex = ref<SearchIndexEntry[]>([]);
const pokedex = ref<Pokemon[]>([]);
const pokedexes = ref<Record<string, PokedexInfo>>({});
const versionGroups = ref<Record<string, VersionGroup>>({});
const selectedLanguage = ref('en');
const selectedPokedex = ref('national');
const selectedPokemon = ref<Pokemon | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const isMobileDrawerOpen = ref(false);

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
    const [langResponse, indexResponse, pokedexResponse, pokedexesResponse, versionGroupsResponse] = await Promise.all([
      LocalDataService.getLanguage(),
      LocalDataService.getIndex(),
      LocalDataService.getPokedex(),
      LocalDataService.getPokedexes(),
      LocalDataService.getVersionGroups()
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
    versionGroups.value = versionGroupsResponse.data;

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
  Analytics.trackLanguageChange(lang);
}

function selectPokedex(dex: string) {
  localStorage.setItem('pokedex', dex);
  selectedPokedex.value = dex;
  selectedPokemon.value = null;
  Analytics.trackPokedexSelect(dex);
}

function selectPokemon(pokemon: Pokemon) {
  selectedPokemon.value = pokemon;
  Analytics.trackPokemonView(pokemon.name, pokemon.id);
  // Ouvrir le drawer sur mobile
  if (window.innerWidth < 1024) {
    isMobileDrawerOpen.value = true;
  }
}

function closeMobileDrawer() {
  isMobileDrawerOpen.value = false;
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
  @apply flex flex-col;
  height: 100dvh;

  // Safe areas iOS
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  // Mobile: max-width pour le contenu
  @apply max-w-2xl;

  // Desktop: largeur max centrée
  @screen lg {
    @apply max-w-5xl;
    padding-left: max(env(safe-area-inset-left), 1rem);
    padding-right: max(env(safe-area-inset-right), 1rem);
  }

  @screen xl {
    @apply max-w-6xl;
  }
}

footer {
  @apply flex justify-center items-center gap-2 flex-wrap;
  @apply text-xs text-gray-500 dark:text-gray-400 py-2;

  .separator {
    @apply text-gray-400 dark:text-gray-600;
  }

  a {
    @apply text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center;
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

    // Desktop: largeur max pour sprites 96x96 (6 cols * 96px + padding)
    @screen lg {
      @apply flex-none;
      max-width: 650px;
    }
  }

  #right-panel {
    // Mobile: caché par défaut
    @apply hidden;

    // Desktop: prend le reste de l'espace disponible
    @screen lg {
      @apply block flex-1 overflow-y-auto;
    }
  }
}
</style>
