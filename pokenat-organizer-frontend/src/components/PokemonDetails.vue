<template>
    <div id="pokemon-details" v-if="pokemon">
        <!-- Header: Image + Infos côte à côte -->
        <div class="header-row">
            <div class="sprite-container">
                <img :src="pokemon.sprite" :alt="pokemon.names[locale]" />
            </div>
            <div class="info">
                <h2 class="name">{{ capitalize(pokemon.names[locale]) }}</h2>
                <span class="number">{{ formatDexName(selectedPokedex) }} #{{ pokemon.pokedex[selectedPokedex].toString().padStart(4, '0') }}</span>

                <!-- Badges légendaire/fabuleux -->
                <div class="badges" v-if="details">
                    <span v-if="details.isLegendary" class="badge legendary">
                        {{ t('pokemon.legendary') }}
                    </span>
                    <span v-if="details.isMythical" class="badge mythical">
                        {{ t('pokemon.mythical') }}
                    </span>
                </div>

                <!-- Types -->
                <div class="types" v-if="details">
                    <span
                        v-for="type in details.types"
                        :key="type"
                        class="type-badge"
                        :class="type"
                    >
                        {{ t(`types.${type}`) }}
                    </span>
                </div>

                <!-- Infos physiques intégrées -->
                <div class="physical-info" v-if="details">
                    <div class="info-item">
                        <span class="label">{{ t('pokemon.height') }}</span>
                        <span class="value">{{ formatHeight(details.height) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">{{ t('pokemon.weight') }}</span>
                        <span class="value">{{ formatWeight(details.weight) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">{{ t('pokemon.generation') }}</span>
                        <span class="value">{{ formatGeneration(details.generation) }}</span>
                    </div>
                </div>

                <!-- Chargement des détails -->
                <div class="loading" v-if="loading">
                    <span>{{ t('common.loading') }}</span>
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-section" v-if="details">
            <h3>Stats</h3>
            <div class="stats-grid">
                <div class="stat-row" v-for="(statValue, statName) in statsList" :key="statName">
                    <span class="stat-name">{{ t(`stats.${statName}`) }}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" :style="{ width: `${(statValue / 255) * 100}%` }"></div>
                    </div>
                    <span class="stat-value">{{ statValue }}</span>
                </div>
            </div>
        </div>

        <!-- Jeux disponibles -->
        <div class="games-section" v-if="availableGames.length > 0">
            <h3>{{ t('pokemon.games') }} ({{ availableGames.length }})</h3>
            <div class="games-list">
                <span v-for="game in availableGames" :key="game" class="game-tag">
                    {{ game }}
                </span>
            </div>
        </div>

        <!-- Accordéon Localisations -->
        <div class="accordion" :class="{ disabled: !loadingEncounters && encounters.length === 0 }">
            <button
                class="accordion-header"
                @click="toggleEncounters"
                :disabled="!loadingEncounters && encounters.length === 0"
                :aria-expanded="isEncountersOpen"
                aria-controls="encounters-content"
            >
                <span>{{ t('pokemon.whereToCatch') }} ({{ loadingEncounters ? '...' : encountersByVersion.length }})</span>
                <svg
                    class="chevron"
                    :class="{ open: isEncountersOpen }"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div id="encounters-content" class="accordion-content encounters-by-version" v-show="isEncountersOpen && encounters.length > 0" role="region">
                <div class="version-group" v-for="versionData in encountersByVersion" :key="versionData.version">
                    <div class="version-header">{{ versionData.versionName }}</div>
                    <ul class="location-list">
                        <li v-for="location in versionData.locations" :key="location">
                            {{ formatLocationName(location) }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Accordéon Pokédex -->
        <div class="accordion">
            <button class="accordion-header" @click="isPokedexOpen = !isPokedexOpen" :aria-expanded="isPokedexOpen" aria-controls="pokedex-content">
                <span>Pokédex ({{ pokedexCount }})</span>
                <svg
                    class="chevron"
                    :class="{ open: isPokedexOpen }"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div id="pokedex-content" class="accordion-content" v-show="isPokedexOpen" role="region">
                <ul>
                    <li v-for="(num, dex) in pokemon.pokedex" :key="dex">
                        <div class="dex-info">
                            <span class="dex-name">{{ formatDexName(dex) }}</span>
                            <span class="dex-num">#{{ num }}</span>
                        </div>
                        <div class="dex-games" v-if="getGamesForPokedex(dex as string).length > 0">
                            {{ getGamesForPokedex(dex as string).join(', ') }}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="pokemon-details" class="empty" v-else>
        <p>{{ t('pokemon.selectPokemon') }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Pokemon, VersionGroup, PokedexInfo } from '@/models/pokemon.model';
import PokeapiDataService, { type PokemonDetails, type PokemonEncounter } from '@/services/PokeapiData.service';
import Analytics from '@/services/Analytics.service';

const props = defineProps<{
    pokemon: Pokemon | null;
    selectedPokedex: string;
    versionGroups: Record<string, VersionGroup>;
    pokedexes: Record<string, PokedexInfo>;
}>();

const { t, locale } = useI18n();

const isPokedexOpen = ref(false);
const isEncountersOpen = ref(false);
const details = ref<PokemonDetails | null>(null);
const encounters = ref<PokemonEncounter[]>([]);
const loading = ref(false);
const loadingEncounters = ref(false);

const pokedexCount = computed(() => {
    if (!props.pokemon) return 0;
    return Object.keys(props.pokemon.pokedex).length;
});

// Obtenir les jeux associés à un pokédex
function getGamesForPokedex(pokedexName: string): string[] {
    const games: string[] = [];
    for (const vg of Object.values(props.versionGroups)) {
        if (vg.pokedexes.includes(pokedexName)) {
            for (const version of vg.versions) {
                const gameName = version.names[locale.value] || version.names['en'] || version.name;
                games.push(gameName);
            }
        }
    }
    return games;
}

// Liste des jeux où ce Pokémon est disponible
const availableGames = computed(() => {
    if (!props.pokemon) return [];
    const games = new Set<string>();
    for (const pokedexName of Object.keys(props.pokemon.pokedex)) {
        for (const game of getGamesForPokedex(pokedexName)) {
            games.add(game);
        }
    }
    return Array.from(games);
});

// Versions liées au pokédex sélectionné
const versionsForSelectedPokedex = computed(() => {
    if (props.selectedPokedex === 'national') {
        return null; // null = toutes les versions
    }

    const versions = new Set<string>();
    for (const vg of Object.values(props.versionGroups)) {
        if (vg.pokedexes.includes(props.selectedPokedex)) {
            for (const version of vg.versions) {
                versions.add(version.name);
            }
        }
    }

    // Si aucune version trouvée pour ce pokédex, afficher toutes les versions
    if (versions.size === 0) {
        return null;
    }

    return versions;
});

// Encounters groupés par version (filtrés selon le pokédex sélectionné)
const encountersByVersion = computed(() => {
    const byVersion: Record<string, string[]> = {};
    const allowedVersions = versionsForSelectedPokedex.value;

    for (const encounter of encounters.value) {
        for (const version of encounter.versions) {
            // Filtrer si un pokédex spécifique est sélectionné
            if (allowedVersions !== null && !allowedVersions.has(version)) {
                continue;
            }

            if (!byVersion[version]) {
                byVersion[version] = [];
            }
            byVersion[version].push(encounter.locationArea);
        }
    }

    // Trier les versions par ordre de version-group
    const sortedVersions = Object.keys(byVersion).sort((a, b) => {
        const orderA = getVersionOrder(a);
        const orderB = getVersionOrder(b);
        return orderA - orderB;
    });

    return sortedVersions.map(version => ({
        version,
        versionName: getVersionName(version),
        locations: byVersion[version]
    }));
});

function getVersionOrder(versionName: string): number {
    for (const vg of Object.values(props.versionGroups)) {
        for (const version of vg.versions) {
            if (version.name === versionName) {
                return vg.order;
            }
        }
    }
    return 999;
}

const statsList = computed(() => {
    if (!details.value) return {};
    return details.value.stats;
});

async function loadDetails(pokemonId: number) {
    loading.value = true;
    try {
        details.value = await PokeapiDataService.getPokemonDetails(pokemonId);
    } catch (error) {
        console.error('Failed to load Pokemon details:', error);
        details.value = null;
    } finally {
        loading.value = false;
    }
}

async function loadEncounters(pokemonId: number) {
    loadingEncounters.value = true;
    try {
        encounters.value = await PokeapiDataService.getEncounters(pokemonId);
    } catch (error) {
        console.error('Failed to load Pokemon encounters:', error);
        encounters.value = [];
    } finally {
        loadingEncounters.value = false;
    }
}

function toggleEncounters() {
    if (encounters.value.length === 0) return;
    isEncountersOpen.value = !isEncountersOpen.value;
    if (isEncountersOpen.value && props.pokemon) {
        Analytics.trackEncountersOpen(props.pokemon.name);
    }
}

function formatLocationName(location: string): string {
    return location
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/ Area$/, '');
}

function getVersionName(versionName: string): string {
    // Chercher le nom traduit dans les versionGroups
    for (const vg of Object.values(props.versionGroups)) {
        for (const version of vg.versions) {
            if (version.name === versionName) {
                return version.names[locale.value] || version.names['en'] || versionName;
            }
        }
    }
    // Fallback: formater le nom
    return versionName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

watch(() => props.pokemon, (newPokemon) => {
    if (newPokemon) {
        loadDetails(newPokemon.id);
        loadEncounters(newPokemon.id);
    } else {
        details.value = null;
        encounters.value = [];
    }
}, { immediate: true });

function formatDexName(dex: string): string {
    const pokedexInfo = props.pokedexes[dex];
    if (pokedexInfo) {
        return pokedexInfo.names[locale.value] || pokedexInfo.names['en'] || dex;
    }
    return dex
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatHeight(decimeters: number): string {
    const meters = decimeters / 10;
    return `${meters.toFixed(1)} m`;
}

function formatWeight(hectograms: number): string {
    const kg = hectograms / 10;
    return `${kg.toFixed(1)} kg`;
}

function formatGeneration(gen: string): string {
    const num = gen.replace('generation-', '').toUpperCase();
    return num;
}

function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<style lang="scss">
#pokemon-details {
    @apply bg-gray-100 dark:bg-gray-800 rounded-lg p-4;
    @apply flex flex-col;
    @apply h-fit;

    &.empty {
        @apply items-center justify-center text-gray-400 dark:text-gray-500 min-h-48;
    }

    .header-row {
        @apply flex gap-4 items-start;

        .sprite-container {
            @apply w-24 h-24 flex-shrink-0 flex items-center justify-center;
            @apply bg-white dark:bg-gray-700 rounded-full shadow-md;

            > img {
                @apply w-20 h-20;
            }
        }

        .info {
            @apply flex-1 min-w-0;

            .name {
                @apply text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight;
            }

            .number {
                @apply text-xs text-gray-500 dark:text-gray-400;
            }

            .badges {
                @apply mt-1 flex flex-wrap gap-1;

                .badge {
                    @apply text-xs px-2 py-0.5 rounded-full font-medium;

                    &.legendary {
                        @apply bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100;
                    }

                    &.mythical {
                        @apply bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100;
                    }
                }
            }

            .types {
                @apply mt-1 flex flex-wrap gap-1;

                .type-badge {
                    @apply text-xs px-2 py-0.5 rounded text-white font-medium uppercase;

                    // Couleurs par type
                    &.normal { @apply bg-gray-400; }
                    &.fire { @apply bg-orange-500; }
                    &.water { @apply bg-blue-500; }
                    &.electric { @apply bg-yellow-400 text-gray-800; }
                    &.grass { @apply bg-green-500; }
                    &.ice { @apply bg-cyan-400; }
                    &.fighting { @apply bg-red-700; }
                    &.poison { @apply bg-purple-500; }
                    &.ground { @apply bg-amber-600; }
                    &.flying { @apply bg-indigo-400; }
                    &.psychic { @apply bg-pink-500; }
                    &.bug { @apply bg-lime-500; }
                    &.rock { @apply bg-stone-500; }
                    &.ghost { @apply bg-purple-700; }
                    &.dragon { @apply bg-violet-600; }
                    &.dark { @apply bg-gray-700; }
                    &.steel { @apply bg-slate-400; }
                    &.fairy { @apply bg-pink-300 text-gray-800; }
                }
            }

            .physical-info {
                @apply mt-2 flex gap-3;

                .info-item {
                    @apply text-center;

                    .label {
                        @apply block text-xs text-gray-500 dark:text-gray-400;
                    }

                    .value {
                        @apply block text-xs font-medium text-gray-700 dark:text-gray-200;
                    }
                }
            }

            .loading {
                @apply mt-2 text-gray-400 text-xs;
            }
        }
    }

    .stats-section {
        @apply mt-4 w-full;

        > h3 {
            @apply text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2;
        }

        .stats-grid {
            @apply space-y-1;

            .stat-row {
                @apply flex items-center gap-2;

                .stat-name {
                    @apply w-12 text-xs text-gray-500 dark:text-gray-400;
                }

                .stat-bar-container {
                    @apply flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden;

                    .stat-bar {
                        @apply h-full bg-red-500 rounded-full;
                        @apply transition-all duration-300;
                    }
                }

                .stat-value {
                    @apply w-8 text-xs text-right text-gray-600 dark:text-gray-300;
                }
            }
        }
    }

    .games-section {
        @apply mt-4 w-full;

        > h3 {
            @apply text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2;
        }

        .games-list {
            @apply flex flex-wrap gap-1;

            .game-tag {
                @apply text-xs px-2 py-0.5 rounded;
                @apply bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200;
            }
        }
    }

    .accordion {
        @apply mt-4 w-full;

        &.disabled {
            @apply opacity-50;

            .accordion-header {
                @apply cursor-not-allowed;

                &:hover {
                    @apply bg-gray-200 dark:bg-gray-700;
                }
            }
        }

        .accordion-header {
            @apply w-full flex justify-between items-center;
            @apply px-3 py-2 rounded;
            @apply bg-gray-200 dark:bg-gray-700;
            @apply text-sm font-semibold text-gray-700 dark:text-gray-200;
            @apply hover:bg-gray-300 dark:hover:bg-gray-600;
            @apply transition-colors;

            .chevron {
                @apply w-5 h-5 transition-transform;

                &.open {
                    @apply rotate-180;
                }
            }
        }

        .accordion-content {
            @apply mt-1;

            .loading-small {
                @apply text-xs text-gray-400 dark:text-gray-500 py-2 text-center;
            }

            > ul {
                @apply space-y-1 max-h-48 overflow-y-auto;

                > li {
                    @apply flex flex-col text-sm px-2 py-1;
                    @apply bg-white dark:bg-gray-700 rounded;

                    .dex-info {
                        @apply flex justify-between;

                        .dex-name {
                            @apply text-gray-600 dark:text-gray-300;
                        }

                        .dex-num {
                            @apply text-gray-400;
                        }
                    }

                    .dex-games {
                        @apply text-xs text-gray-400 dark:text-gray-500 mt-0.5;
                    }
                }
            }

            // Encounters groupés par version
            &.encounters-by-version {
                @apply max-h-64 overflow-y-auto space-y-2;

                .version-group {
                    .version-header {
                        @apply text-xs font-semibold text-gray-500 dark:text-gray-400;
                        @apply px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-t;
                    }

                    .location-list {
                        @apply bg-white dark:bg-gray-700 rounded-b;

                        > li {
                            @apply text-xs text-gray-600 dark:text-gray-300;
                            @apply px-2 py-0.5;
                            @apply border-b border-gray-100 dark:border-gray-600 last:border-b-0;
                        }
                    }
                }
            }
        }
    }
}
</style>
