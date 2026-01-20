<template>
  <div id="container">
    <Header
      :languages="languages"
      :selectedLanguage="locale"
      @select-language="selectLanguage"
    />

    <template v-if="loading">
      <div class="flex-1 flex items-center justify-center">
        <span class="text-gray-500">{{ t('app.loadingPokedex') }}</span>
      </div>
    </template>

    <template v-else-if="error">
      <div class="flex-1 flex flex-col items-center justify-center gap-4">
        <span class="text-red-500">{{ error }}</span>
        <button @click="loadData" class="px-4 py-2 bg-red-600 text-white rounded">
          {{ t('common.retry') }}
        </button>
      </div>
    </template>

    <template v-else>
      <div id="main-content">
        <div id="left-panel">
          <PokedexSelector
            :pokedexes="pokedexes"
            :selectedPokedex="selectedPokedex"
            @select-pokedex="selectPokedex"
          />
          <SearchBar
            :index="searchIndex"
            :pokedex="filteredPokedex"
            :selectedPokedex="selectedPokedex"
            @select-pokemon="selectPokemon"
          />
          <Organizer
            :pokemon="selectedPokemon"
            :pokedex="filteredPokedex"
            :selectedPokedex="selectedPokedex"
            @select-pokemon="selectPokemon"
          />
        </div>
        <aside id="right-panel">
          <PokemonDetails
            :pokemon="selectedPokemon"
            :selectedPokedex="selectedPokedex"
            :versionGroups="versionGroups"
            :pokedexes="pokedexes"
          />
        </aside>
      </div>

      <!-- Mobile Drawer pour les détails -->
      <MobileDrawer :isOpen="isMobileDrawerOpen" @close="closeMobileDrawer">
        <PokemonDetails
          :pokemon="selectedPokemon"
          :selectedPokedex="selectedPokedex"
          :versionGroups="versionGroups"
          :pokedexes="pokedexes"
        />
      </MobileDrawer>
    </template>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Pokemon, PokedexInfo, VersionGroup } from '@/models/pokemon.model';
import LocalDataService from '@/services/LocalData.service';
import Analytics from '@/services/Analytics.service';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import PokedexSelector from '@/components/PokedexSelector.vue';
import SearchBar from '@/components/SearchBar.vue';
import Organizer from '@/components/Organizer.vue';
import PokemonDetails from '@/components/PokemonDetails.vue';
import MobileDrawer from '@/components/MobileDrawer.vue';

const { t, locale } = useI18n();

interface SearchIndexEntry {
  id: string;
  name: string;
}

const languages = ref<string[]>([]);
const searchIndex = ref<SearchIndexEntry[]>([]);
const pokedex = ref<Pokemon[]>([]);
const pokedexes = ref<Record<string, PokedexInfo>>({});
const versionGroups = ref<Record<string, VersionGroup>>({});
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
    error.value = t('app.loadError');
    console.error('Failed to load data:', e);
  } finally {
    loading.value = false;
  }
}

function selectLanguage(lang: string) {
  localStorage.setItem('language', lang);
  locale.value = lang;
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
  selectedPokemon.value = null;
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
