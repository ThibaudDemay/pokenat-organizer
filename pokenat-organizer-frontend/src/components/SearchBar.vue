<template>
    <div id="search-bar">
        <div id="search-input">
            <input name="search" autocomplete="off" v-model="search" placeholder="Search Pokémon"/>
        </div>
        <div id="search-result" v-show="search">
            <ul v-for="searchdata in [searchResult()]" :key='searchdata'>
                <li v-if="searchdata.length >= maxItem">{{searchdata.length}} items. To many items in search results</li>
                <li v-else-if="searchdata.length < maxItem" class="pokemon" v-for="(pokemon, i) in searchdata" :key="i" v-on:click="selectPokemon(pokemon)">
                    <img class="sprite" :src="pokemon.sprite" />
                    <span class="name">
                        {{ pokemon.names['fr']  }}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Pokemon from '@/models/pokemon.model';

@Options({
  props: {
    index: {
        type: Array,
        required: true,
        default: []
    },
    pokedex: {
        type: Array,
        required: true,
        default: []
    },
    maxItem: {
        type: Number,
        default: 20
    }
  }
})
export default class SearchBar extends Vue {
    private index!: Array<Record<string, string>>;
    private pokedex!: Array<Pokemon>;
    private search: string = "";
    private searchdata: Array<Pokemon> = [];
    private maxItem!: number;

    public searchResult(): Array<Pokemon> {
        let ids = this.filteredList().map(item => Number(item.id))
        ids = Array.from(new Set(ids))
        return this.pokedex.filter(elem => {
            return ids.includes(elem['id']) 
        })
    }

    public filteredList(): Array<Record<string, string>> {
        if ( this.search.length == 0 )
            return []
        return this.index.filter(elem => {
            return elem['name'].toLowerCase().includes(this.search.toLowerCase())
        })
    }

    public selectPokemon(pokemon: Pokemon): void {
        console.log(pokemon)
    }

}
</script>

<style lang="scss">
#search-bar {
    @apply bg-gray-200;
    > #search-input {
        @apply p-1;
        > input {
            @apply bg-gray-100 w-full h-8 p-2;

            &:focus {
                @apply bg-white;
            }
        }
    }
    > #search-result {
        @apply bg-gray-200;
        @apply absolute w-full px-1 pb-1;
        > ul {
            @apply flex flex-col bg-gray-100;
            @apply max-h-1/4 w-full overflow-y-auto;

            > li.pokemon {
                @apply flex flex-row items-center;
                @apply rounded;

                > img.sprite {
                    @apply h-14;
                }
                > span.name {
                    @apply p-4 text-lg;
                }

                &:hover {
                    @apply bg-gray-300;
                }

                &:active {
                    @apply bg-gray-400;
                }
            }
        }
    }
}
</style>