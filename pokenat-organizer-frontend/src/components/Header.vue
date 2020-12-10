<template>
    <header>
        <div id="ret">
        </div>
        <div id="brand">
            Pokenat Organizer
        </div>
        <div id="lang">
            <button id="lang-menu" aria-haspopup="true" aria-expanded="true" v-on:click="toggleLangDropdown">
                {{langSelect}}
                <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div id="lang-dropdown" :class="{'hidden': !languageDropdownShow, 'block': languageDropdownShow}">
                <ul class="menu-lang" role="menu" aria-orientation="vertical" aria-labelledby="lang-menu">
                    <li class="item-lang" v-for="lang in language" :key="lang" v-on:click="selectLanguage(lang)">
                        {{lang}}
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
    props: {
        language: {
            type: Array,
            required: true
        },
        langSelect: {
            type: String,
            required: true
        }
    },
    emits: ['select-language']
})
export default class Header extends Vue {
    private languageDropdownShow: boolean = false;
    private language!: Array<string>;
    private langSelect!: string;

    private toggleLangDropdown() {
        this.languageDropdownShow = !this.languageDropdownShow
    }

    private selectLanguage(language: string) {
        this.languageDropdownShow = false
        this.$emit('select-language', language)
    }
}
</script>

<style lang="scss">

header {
    @apply w-full; // relative w-full z-10 fixed top-0
    @apply text-white font-bold py-1 h-12;
    @apply bg-red-600 border-b border-gray-200;
    @apply flex justify-center items-center;

    #ret {
        @apply w-16 flex-none;
    }

    #brand {
        @apply flex-grow text-center;
    }

    #lang {
        @apply w-20 relative flex-none text-center pr-2;
        > #lang-menu {
            // @apply px-2 py-1;
            @apply inline-flex justify-center w-full rounded-md border border-red-900 shadow-sm px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-800 focus:ring-transparent;
        }

        > #lang-dropdown {
            @apply origin-top-right absolute right-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5;

            > .menu-lang {
                @apply py-1;

                > .item-lang {
                    @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900;
                }
            }
        }
    }
}

</style>