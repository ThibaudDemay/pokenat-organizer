<template>
    <div id="organizer">
        <div class="pokemon-tooltip" v-if="hoveredPokemon" :style="tooltipStyle">
            {{ hoveredPokemon.names[lang] }} #{{ hoveredPokemon.pokedex[selectedPokedex] }}
        </div>
        <div>
            <nav id="box-nav">
                <button class="box-previous" @click="changeBox(-1)">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="box-number">Box {{ currentBox + 1 }}</div>
                <button class="box-next" @click="changeBox(+1)">
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
                        <img v-if="cp.sprite" :src="cp.sprite" :alt="cp.names[lang]" />
                        <div class="pokename" v-else>{{ cp.names[lang] }}</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Pokemon } from '@/models/pokemon.model';

const props = defineProps<{
    pokemon: Pokemon | null;
    pokedex: Pokemon[];
    selectedPokedex: string;
    lang: string;
}>();

const emit = defineEmits<{
    'select-pokemon': [pokemon: Pokemon];
}>();

const currentBox = ref(0);
const hoveredPokemon = ref<Pokemon | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

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

// Reset to box 0 when pokedex changes
watch(() => props.pokedex, () => {
    currentBox.value = 0;
});

watch(() => props.pokemon, (newPokemon) => {
    if (newPokemon) {
        navigateToBox(newPokemon);
    }
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
        @apply flex my-1 px-1 h-10 items-center;
        @apply bg-gray-300 dark:bg-gray-700 rounded;
        @apply text-gray-800 dark:text-gray-200;

        button.box-previous, button.box-next {
            @apply flex-none h-10 w-20;
            @apply hover:bg-gray-400 dark:hover:bg-gray-600 rounded;
            > svg {
                @apply m-auto;
            }
        }

        .box-number {
            @apply flex-grow text-center;
        }
    }

    ul#box {
        @apply flex flex-wrap;
        @apply bg-green-100 dark:bg-green-900 rounded;
        > li.box-case {
            @apply flex p-2 cursor-pointer;
            @apply bg-white dark:bg-green-800 bg-opacity-50 dark:bg-opacity-50;
            @apply transition-transform hover:scale-105;

            > .box-case-content {
                @apply flex flex-grow justify-center items-center;
                @apply rounded;
                @apply bg-white dark:bg-green-700 bg-opacity-50 dark:bg-opacity-50;

                &.active {
                    @apply bg-red-900 bg-opacity-50;
                }
            }

        }
    }
}

</style>