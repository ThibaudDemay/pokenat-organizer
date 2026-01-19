<template>
    <div id="pokemon-details" v-if="pokemon">
        <div class="sprite-container">
            <img :src="pokemon.sprite" :alt="pokemon.names[lang]" />
        </div>
        <div class="info">
            <h2 class="name">{{ pokemon.names[lang] }}</h2>
            <span class="number">{{ formatDexName(selectedPokedex) }} #{{ pokemon.pokedex[selectedPokedex].toString().padStart(4, '0') }}</span>

            <!-- Badges légendaire/fabuleux -->
            <div class="badges" v-if="details">
                <span v-if="details.isLegendary" class="badge legendary">
                    {{ lang === 'fr' ? 'Légendaire' : 'Legendary' }}
                </span>
                <span v-if="details.isMythical" class="badge mythical">
                    {{ lang === 'fr' ? 'Fabuleux' : 'Mythical' }}
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
                    {{ getTypeName(type) }}
                </span>
            </div>
        </div>

        <!-- Chargement des détails -->
        <div class="loading" v-if="loading">
            <span>{{ lang === 'fr' ? 'Chargement...' : 'Loading...' }}</span>
        </div>

        <!-- Infos physiques -->
        <div class="physical-info" v-if="details">
            <div class="info-item">
                <span class="label">{{ lang === 'fr' ? 'Taille' : 'Height' }}</span>
                <span class="value">{{ formatHeight(details.height) }}</span>
            </div>
            <div class="info-item">
                <span class="label">{{ lang === 'fr' ? 'Poids' : 'Weight' }}</span>
                <span class="value">{{ formatWeight(details.weight) }}</span>
            </div>
            <div class="info-item">
                <span class="label">{{ lang === 'fr' ? 'Génération' : 'Generation' }}</span>
                <span class="value">{{ formatGeneration(details.generation) }}</span>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-section" v-if="details">
            <h3>Stats</h3>
            <div class="stats-grid">
                <div class="stat-row" v-for="(value, name) in statsList" :key="name">
                    <span class="stat-name">{{ getStatLabel(name) }}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar" :style="{ width: `${(value / 255) * 100}%` }"></div>
                    </div>
                    <span class="stat-value">{{ value }}</span>
                </div>
            </div>
        </div>

        <!-- Accordéon Pokédex -->
        <div class="accordion">
            <button class="accordion-header" @click="isPokedexOpen = !isPokedexOpen">
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
            <div class="accordion-content" v-show="isPokedexOpen">
                <ul>
                    <li v-for="(num, dex) in pokemon.pokedex" :key="dex">
                        <span class="dex-name">{{ formatDexName(dex) }}</span>
                        <span class="dex-num">#{{ num }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div id="pokemon-details" class="empty" v-else>
        <p>{{ lang === 'fr' ? 'Sélectionnez un Pokémon' : 'Select a Pokémon' }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Pokemon } from '@/models/pokemon.model';
import PokeapiDataService, { type PokemonDetails } from '@/services/PokeapiData.service';

const props = defineProps<{
    pokemon: Pokemon | null;
    selectedPokedex: string;
    lang: string;
}>();

// Traductions des types
const typeNames: Record<string, Record<string, string>> = {
    normal: { en: 'Normal', fr: 'Normal' },
    fire: { en: 'Fire', fr: 'Feu' },
    water: { en: 'Water', fr: 'Eau' },
    electric: { en: 'Electric', fr: 'Électrik' },
    grass: { en: 'Grass', fr: 'Plante' },
    ice: { en: 'Ice', fr: 'Glace' },
    fighting: { en: 'Fighting', fr: 'Combat' },
    poison: { en: 'Poison', fr: 'Poison' },
    ground: { en: 'Ground', fr: 'Sol' },
    flying: { en: 'Flying', fr: 'Vol' },
    psychic: { en: 'Psychic', fr: 'Psy' },
    bug: { en: 'Bug', fr: 'Insecte' },
    rock: { en: 'Rock', fr: 'Roche' },
    ghost: { en: 'Ghost', fr: 'Spectre' },
    dragon: { en: 'Dragon', fr: 'Dragon' },
    dark: { en: 'Dark', fr: 'Ténèbres' },
    steel: { en: 'Steel', fr: 'Acier' },
    fairy: { en: 'Fairy', fr: 'Fée' },
};

function getTypeName(type: string): string {
    return typeNames[type]?.[props.lang] || type;
}

const isPokedexOpen = ref(false);
const details = ref<PokemonDetails | null>(null);
const loading = ref(false);

const pokedexCount = computed(() => {
    if (!props.pokemon) return 0;
    return Object.keys(props.pokemon.pokedex).length;
});

const statsList = computed(() => {
    if (!details.value) return {};
    return {
        'hp': details.value.stats.hp,
        'attack': details.value.stats.attack,
        'defense': details.value.stats.defense,
        'specialAttack': details.value.stats.specialAttack,
        'specialDefense': details.value.stats.specialDefense,
        'speed': details.value.stats.speed,
    };
});

// Traduction des labels des stats
const statLabels: Record<string, Record<string, string>> = {
    hp: { en: 'HP', fr: 'PV' },
    attack: { en: 'Attack', fr: 'Attaque' },
    defense: { en: 'Defense', fr: 'Défense' },
    specialAttack: { en: 'Sp. Atk', fr: 'Att. Spé' },
    specialDefense: { en: 'Sp. Def', fr: 'Déf. Spé' },
    speed: { en: 'Speed', fr: 'Vitesse' },
};

function getStatLabel(statKey: string): string {
    return statLabels[statKey]?.[props.lang] || statKey;
}

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

watch(() => props.pokemon, (newPokemon) => {
    if (newPokemon) {
        loadDetails(newPokemon.id);
    } else {
        details.value = null;
    }
}, { immediate: true });

function formatDexName(dex: string): string {
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
</script>

<style lang="scss">
#pokemon-details {
    @apply bg-gray-100 dark:bg-gray-800 rounded-lg p-4;
    @apply flex flex-col items-center;

    &.empty {
        @apply justify-center text-gray-400 dark:text-gray-500 h-full min-h-48;
    }

    .sprite-container {
        @apply w-32 h-32 flex items-center justify-center;
        @apply bg-white dark:bg-gray-700 rounded-full shadow-md;

        > img {
            @apply w-24 h-24;
        }
    }

    .info {
        @apply mt-4 text-center;

        .name {
            @apply text-xl font-bold text-gray-800 dark:text-gray-100;
        }

        .number {
            @apply text-sm text-gray-500 dark:text-gray-400;
        }

        .badges {
            @apply mt-1 flex justify-center gap-1;

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
            @apply mt-2 flex justify-center gap-1;

            .type-badge {
                @apply text-xs px-2 py-1 rounded text-white font-medium uppercase;

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
    }

    .loading {
        @apply mt-4 text-gray-400 text-sm;
    }

    .physical-info {
        @apply mt-4 w-full grid grid-cols-3 gap-2;

        .info-item {
            @apply text-center;

            .label {
                @apply block text-xs text-gray-500 dark:text-gray-400;
            }

            .value {
                @apply block text-sm font-medium text-gray-700 dark:text-gray-200;
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

    .accordion {
        @apply mt-4 w-full;

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

            > ul {
                @apply space-y-1 max-h-48 overflow-y-auto;

                > li {
                    @apply flex justify-between text-sm px-2 py-1;
                    @apply bg-white dark:bg-gray-700 rounded;

                    .dex-name {
                        @apply text-gray-600 dark:text-gray-300;
                    }

                    .dex-num {
                        @apply text-gray-400;
                    }
                }
            }
        }
    }
}
</style>
