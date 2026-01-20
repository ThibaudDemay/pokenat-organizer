<template>
    <header>
        <div id="theme-toggle">
            <button @click="toggleDarkMode" :aria-label="isDark ? t('header.lightMode') : t('header.darkMode')">
                <!-- Soleil (mode clair) -->
                <svg v-if="isDark" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                </svg>
                <!-- Lune (mode sombre) -->
                <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </button>
        </div>
        <div id="brand">
            Pokenat Organizer
        </div>
        <div id="lang" ref="dropdownRef">
            <button
                id="lang-menu"
                aria-haspopup="true"
                :aria-expanded="isDropdownOpen"
                @click="toggleDropdown"
            >
                {{ selectedLanguage }}
                <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div
                v-show="isDropdownOpen"
                id="lang-dropdown"
            >
                <ul class="menu-lang" role="menu" aria-orientation="vertical" aria-labelledby="lang-menu">
                    <li
                        v-for="lang in languages"
                        :key="lang"
                        class="item-lang"
                        :class="{ 'font-bold': lang === selectedLanguage }"
                        @click="handleSelectLanguage(lang)"
                    >
                        {{ lang }}
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    languages: string[];
    selectedLanguage: string;
}>();

const emit = defineEmits<{
    'select-language': [language: string];
}>();

const { t } = useI18n();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const isDark = ref(false);

function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
}

function handleSelectLanguage(lang: string) {
    isDropdownOpen.value = false;
    if (lang !== props.selectedLanguage) {
        emit('select-language', lang);
    }
}

function toggleDarkMode() {
    isDark.value = !isDark.value;
    if (isDark.value) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false');
}

function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = savedMode ? savedMode === 'true' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark.value);
}

function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isDropdownOpen.value = false;
    }
}

onMounted(() => {
    initDarkMode();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss">

header {
    @apply w-full;
    @apply text-white font-bold py-1 h-12;
    @apply bg-red-600 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
    @apply flex justify-center items-center;

    #theme-toggle {
        @apply w-16 flex-none flex justify-center;

        > button {
            @apply p-2 rounded-full;
            @apply hover:bg-red-700 dark:hover:bg-gray-700;
            @apply transition-colors;
        }
    }

    #brand {
        @apply flex-grow text-center;
    }

    #lang {
        @apply w-20 relative flex-none text-center pr-2;
        > #lang-menu {
            @apply inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 text-sm font-medium text-white;
            @apply border border-red-900 dark:border-gray-600;
            @apply bg-red-600 dark:bg-gray-700 hover:bg-red-700 dark:hover:bg-gray-600;
            @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 dark:focus:ring-offset-gray-800 focus:ring-transparent;
        }

        > #lang-dropdown {
            @apply origin-top-right absolute right-0 mt-2 w-24 rounded-md shadow-lg z-10;
            @apply bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5;

            > .menu-lang {
                @apply py-1;

                > .item-lang {
                    @apply block px-4 py-2 text-sm cursor-pointer;
                    @apply text-gray-700 dark:text-gray-200;
                    @apply hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white;
                }
            }
        }
    }
}

</style>