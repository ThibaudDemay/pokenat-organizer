<template>
    <div id="pokedex-selector" ref="selectorRef">
        <button
            id="pokedex-btn"
            @click="toggleDropdown"
            :aria-expanded="isOpen"
        >
            <span class="label">{{ selectedPokedexName }}</span>
            <svg class="chevron" :class="{ open: isOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
        <div id="pokedex-dropdown" v-show="isOpen">
            <ul>
                <li
                    v-for="dex in sortedPokedexes"
                    :key="dex.name"
                    :class="{ active: dex.name === selectedPokedex }"
                    @click="selectPokedex(dex.name)"
                >
                    {{ dex.names[lang] || dex.names['en'] || dex.name }}
                    <span class="count">({{ dex.count }})</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { PokedexInfo } from '@/models/pokemon.model';

const props = defineProps<{
    pokedexes: Record<string, PokedexInfo>;
    selectedPokedex: string;
    lang: string;
}>();

const emit = defineEmits<{
    'select-pokedex': [pokedex: string];
}>();

const isOpen = ref(false);
const selectorRef = ref<HTMLElement | null>(null);

const sortedPokedexes = computed(() => {
    const list = Object.values(props.pokedexes);
    // Tri: "national" en premier, puis par id
    return list.sort((a, b) => {
        if (a.name === 'national') return -1;
        if (b.name === 'national') return 1;
        return a.id - b.id;
    });
});

const selectedPokedexName = computed(() => {
    const dex = props.pokedexes[props.selectedPokedex];
    if (!dex) return props.selectedPokedex;
    return dex.names[props.lang] || dex.names['en'] || dex.name;
});

function toggleDropdown() {
    isOpen.value = !isOpen.value;
}

function selectPokedex(dex: string) {
    isOpen.value = false;
    if (dex !== props.selectedPokedex) {
        emit('select-pokedex', dex);
    }
}

function handleClickOutside(event: MouseEvent) {
    if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
        isOpen.value = false;
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
#pokedex-selector {
    @apply relative p-1;
    @apply bg-gray-200 dark:bg-gray-800;

    #pokedex-btn {
        @apply w-full h-10 px-3;
        @apply flex items-center justify-between;
        @apply bg-gray-100 dark:bg-gray-700 rounded;
        @apply text-gray-900 dark:text-gray-100;
        @apply hover:bg-gray-200 dark:hover:bg-gray-600;
        @apply transition-colors;

        .label {
            @apply font-medium;
        }

        .chevron {
            @apply w-5 h-5 transition-transform;

            &.open {
                @apply rotate-180;
            }
        }
    }

    #pokedex-dropdown {
        @apply absolute top-full left-1 right-1 mt-1 z-20;
        @apply bg-white dark:bg-gray-700 rounded shadow-lg;
        @apply border border-gray-200 dark:border-gray-600;

        > ul {
            @apply max-h-64 overflow-y-auto py-1;

            > li {
                @apply px-3 py-2 cursor-pointer;
                @apply text-gray-700 dark:text-gray-200;
                @apply hover:bg-gray-100 dark:hover:bg-gray-600;
                @apply flex justify-between items-center;

                &.active {
                    @apply bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200;
                }

                .count {
                    @apply text-sm text-gray-400;
                }
            }
        }
    }
}
</style>
