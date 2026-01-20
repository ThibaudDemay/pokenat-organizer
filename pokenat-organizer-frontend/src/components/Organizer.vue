<template>
    <div id="organizer">
        <div class="pokemon-tooltip" v-if="hoveredPokemon" :style="tooltipStyle">
            {{ hoveredPokemon.names[locale] }} #{{ hoveredPokemon.pokedex[selectedPokedex] }}
        </div>
        <div>
            <nav id="box-nav">
                <button class="box-previous" @click="changeBox(-1)" :disabled="currentBox === 0" :aria-label="t('organizer.previousBox')">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="box-selector-wrapper">
                    <button class="box-number" @click="toggleBoxSelector">
                        Box {{ currentBox + 1 }} / {{ totalBoxes }}
                    </button>
                    <div class="box-dropdown" v-if="showBoxSelector">
                        <button
                            v-for="box in totalBoxes"
                            :key="box"
                            class="box-option"
                            :class="{ active: box - 1 === currentBox }"
                            @click="selectBox(box - 1)"
                        >
                            {{ box }}
                        </button>
                    </div>
                </div>
                <button class="box-next" @click="changeBox(+1)" :disabled="currentBox >= totalBoxes - 1" :aria-label="t('organizer.nextBox')">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </nav>
            <ul id="box">
                <li
                    class="box-case"
                    v-for="cp in pokemonsInBox"
                    :style="boxCaseStyle"
                    :key="cp.id"
                    @click="handleSelect(cp)"
                    @mouseenter="handleHover(cp, $event)"
                    @mouseleave="hoveredPokemon = null"
                >
                    <div class="box-case-content" :class="{ active: pokemon && cp.id === pokemon.id }">
                        <div v-if="cp.sprite" class="sprite-container">
                            <div v-if="!loadedImages.has(cp.id)" class="sprite-placeholder"></div>
                            <img
                                :src="cp.sprite"
                                :alt="cp.names[locale]"
                                :class="{ loaded: loadedImages.has(cp.id) }"
                                loading="lazy"
                                @load="onImageLoad(cp.id)"
                            />
                        </div>
                        <div class="pokename" v-else>{{ cp.names[locale] }}</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Pokemon } from '@/models/pokemon.model';

const props = defineProps<{
    pokemon: Pokemon | null;
    pokedex: Pokemon[];
    selectedPokedex: string;
}>();

const emit = defineEmits<{
    'select-pokemon': [pokemon: Pokemon];
}>();

const { t, locale } = useI18n();
const currentBox = ref(0);
const hoveredPokemon = ref<Pokemon | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });
const showBoxSelector = ref(false);
const loadedImages = ref<Set<number>>(new Set());

const NB_COLS = 6;
const NB_ROWS = 5;
const NB_PER_BOX = NB_COLS * NB_ROWS;

const totalBoxes = computed(() => Math.ceil(props.pokedex.length / NB_PER_BOX));

const boxCaseStyle = computed(() => ({
    width: `${100 / NB_COLS}%`
}));

const tooltipStyle = computed(() => ({
    left: `${tooltipPosition.value.x}px`,
    top: `${tooltipPosition.value.y}px`
}));

const pokemonsInBox = computed(() => {
    const start = currentBox.value * NB_PER_BOX;
    const end = start + NB_PER_BOX;
    return props.pokedex.slice(start, end);
});

function navigateToBox(pokemon: Pokemon) {
    // Trouver l'index du Pokémon dans le tableau filtré
    const index = props.pokedex.findIndex(p => p.id === pokemon.id);
    if (index !== -1) {
        currentBox.value = Math.floor(index / NB_PER_BOX);
    }
}

function changeBox(delta: number) {
    const newBox = currentBox.value + delta;
    if (newBox >= 0 && newBox < totalBoxes.value) {
        currentBox.value = newBox;
    }
}

function toggleBoxSelector() {
    showBoxSelector.value = !showBoxSelector.value;
}

function selectBox(boxIndex: number) {
    currentBox.value = boxIndex;
    showBoxSelector.value = false;
}

function handleSelect(pokemon: Pokemon) {
    emit('select-pokemon', pokemon);
}

function handleHover(pokemon: Pokemon, event: MouseEvent) {
    hoveredPokemon.value = pokemon;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    tooltipPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
    };
}

function onImageLoad(pokemonId: number) {
    loadedImages.value = new Set([...loadedImages.value, pokemonId]);
}

// Reset to box 0 when pokedex changes
watch(() => props.pokedex, () => {
    currentBox.value = 0;
});

watch(() => props.pokemon, (newPokemon) => {
    if (newPokemon) {
        navigateToBox(newPokemon);
    }
});

// Fermer le dropdown au clic à l'extérieur
function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.box-selector-wrapper')) {
        showBoxSelector.value = false;
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

#organizer {
    @apply flex-1 overflow-y-auto relative;

    .pokemon-tooltip {
        @apply fixed z-50 px-2 py-1;
        @apply bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-sm rounded shadow-lg;
        @apply pointer-events-none;
        transform: translate(-50%, -100%);
    }

    nav#box-nav {
        @apply flex my-1 px-1 py-1 items-center;
        @apply bg-gray-300 dark:bg-gray-700 rounded;
        @apply text-gray-800 dark:text-gray-200;

        button.box-previous, button.box-next {
            @apply flex-none h-8 w-16;
            @apply hover:bg-gray-400 dark:hover:bg-gray-600 rounded;
            @apply transition-opacity;
            > svg {
                @apply m-auto;
            }
            &:disabled {
                @apply opacity-30 cursor-not-allowed;
                &:hover {
                    @apply bg-transparent dark:bg-transparent;
                }
            }
        }

        .box-selector-wrapper {
            @apply flex-grow relative;

            .box-number {
                @apply w-full h-8 text-center cursor-pointer;
                @apply hover:bg-gray-400 dark:hover:bg-gray-600 rounded;
                @apply transition-colors;
            }

            .box-dropdown {
                @apply absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50;
                @apply bg-white dark:bg-gray-800 rounded shadow-lg;
                @apply border border-gray-300 dark:border-gray-600;
                @apply p-3 grid gap-2;
                @apply max-h-72 overflow-y-auto;
                grid-template-columns: repeat(8, minmax(0, 1fr));
                min-width: 340px;

                .box-option {
                    @apply w-9 h-9 rounded;
                    @apply hover:bg-gray-200 dark:hover:bg-gray-700;
                    @apply transition-colors text-sm;

                    &.active {
                        @apply bg-blue-500 text-white;
                        &:hover {
                            @apply bg-blue-600;
                        }
                    }
                }
            }
        }
    }

    ul#box {
        @apply flex flex-wrap overflow-hidden;
        @apply bg-green-100 dark:bg-green-900 rounded;
        > li.box-case {
            @apply flex p-2 cursor-pointer;
            @apply bg-white dark:bg-green-800 bg-opacity-50 dark:bg-opacity-50;
            @apply transition-transform hover:scale-105 hover:z-10;

            > .box-case-content {
                @apply flex flex-grow justify-center items-center;
                @apply rounded;
                @apply bg-white dark:bg-green-700 bg-opacity-50 dark:bg-opacity-50;

                &.active {
                    @apply bg-red-900 bg-opacity-50;
                }

                .sprite-container {
                    @apply relative w-full aspect-square flex items-center justify-center;
                    max-width: 96px;
                    max-height: 96px;

                    .sprite-placeholder {
                        @apply absolute inset-0 m-2 rounded-lg;
                        @apply bg-gray-200 dark:bg-gray-600;
                        animation: pulse 1.5s ease-in-out infinite;
                    }

                    img {
                        @apply w-full h-full object-contain opacity-0 transition-opacity duration-200;

                        &.loaded {
                            @apply opacity-100;
                        }
                    }
                }
            }

        }
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 0.4;
    }
    50% {
        opacity: 0.7;
    }
}

</style>