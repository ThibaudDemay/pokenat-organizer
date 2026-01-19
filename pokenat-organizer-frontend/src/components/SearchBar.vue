<template>
    <div id="search-bar" ref="searchBarRef">
        <div id="search-input">
            <input
                name="search"
                autocomplete="off"
                v-model="searchQuery"
                :placeholder="placeholder"
                @focus="isInputFocused = true"
            />
            <button
                v-if="searchQuery"
                class="clear-btn"
                @click="clearSearch"
                aria-label="Effacer la recherche"
            >
                ×
            </button>
        </div>
        <div id="search-result" v-show="showResults">
            <ul>
                <li v-if="searchResults.length >= maxResults" class="info">
                    {{ searchResults.length }} résultats. Affinez votre recherche.
                </li>
                <template v-else>
                    <li
                        v-for="pokemon in searchResults"
                        :key="pokemon.id"
                        class="pokemon"
                        @click="handleSelectPokemon(pokemon)"
                    >
                        <img class="sprite" :src="pokemon.sprite" :alt="pokemon.names[lang]" />
                        <span class="name">{{ pokemon.names[lang] }}</span>
                        <span class="number">#{{ pokemon.pokedex[selectedPokedex] }}</span>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Pokemon } from '@/models/pokemon.model';

interface SearchIndexEntry {
    id: string;
    name: string;
}

const props = withDefaults(defineProps<{
    index: SearchIndexEntry[];
    pokedex: Pokemon[];
    selectedPokedex: string;
    maxResults?: number;
    lang: string;
}>(), {
    index: () => [],
    pokedex: () => [],
    selectedPokedex: 'national',
    maxResults: 20
});

const emit = defineEmits<{
    'select-pokemon': [pokemon: Pokemon];
}>();

const searchQuery = ref('');
const isInputFocused = ref(false);
const searchBarRef = ref<HTMLElement | null>(null);

const placeholder = computed(() =>
    props.lang === 'fr' ? 'Rechercher un Pokémon...' : 'Search Pokémon...'
);

const showResults = computed(() =>
    searchQuery.value.length > 0 && searchResults.value.length > 0 && isInputFocused.value
);

const matchingIds = computed(() => {
    if (searchQuery.value.length === 0) return new Set<number>();

    const query = searchQuery.value.toLowerCase();
    const ids = new Set<number>();

    for (const entry of props.index) {
        if (entry.name.toLowerCase().includes(query)) {
            ids.add(Number(entry.id));
        }
    }

    return ids;
});

const searchResults = computed(() => {
    if (matchingIds.value.size === 0) return [];

    return props.pokedex.filter(pokemon => matchingIds.value.has(pokemon.id));
});

function handleSelectPokemon(pokemon: Pokemon) {
    emit('select-pokemon', pokemon);
    clearSearch();
}

function clearSearch() {
    searchQuery.value = '';
    isInputFocused.value = false;
}

function handleClickOutside(event: MouseEvent) {
    if (searchBarRef.value && !searchBarRef.value.contains(event.target as Node)) {
        isInputFocused.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss">
#search-bar {
    @apply bg-gray-200 dark:bg-gray-800;

    > #search-input {
        @apply p-1 relative;

        > input {
            @apply bg-gray-100 dark:bg-gray-700 w-full h-10 px-3 pr-10 rounded;
            @apply text-base text-gray-900 dark:text-gray-100;

            &:focus {
                @apply bg-white dark:bg-gray-600 outline-none ring-2 ring-red-500;
            }
        }

        > .clear-btn {
            @apply absolute right-3 top-1/2 -translate-y-1/2;
            @apply w-6 h-6 flex items-center justify-center;
            @apply text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold;
            @apply rounded-full hover:bg-gray-300 dark:hover:bg-gray-600;
        }
    }

    > #search-result {
        @apply bg-gray-200 dark:bg-gray-800;
        @apply absolute max-w-2xl w-full px-1 pb-1 z-10;

        > ul {
            @apply flex flex-col bg-gray-100 dark:bg-gray-700 py-1 rounded shadow-lg;
            @apply max-h-1/4 w-full overflow-y-auto;

            > li.info {
                @apply px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center;
            }

            > li.pokemon {
                @apply flex flex-row items-center h-14 px-2;
                @apply cursor-pointer;

                > img.sprite {
                    @apply h-12 w-12 flex-shrink-0;
                }

                > span.name {
                    @apply flex-1 px-3 text-base text-gray-900 dark:text-gray-100;
                }

                > span.number {
                    @apply text-sm text-gray-400 pr-2;
                }

                &:hover {
                    @apply bg-gray-200 dark:bg-gray-600;
                }

                &:active {
                    @apply bg-gray-300 dark:bg-gray-500;
                }
            }
        }
    }
}
</style>