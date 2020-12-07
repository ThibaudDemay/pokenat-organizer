<template>
  <div id="container">
    <Header />
    <SearchBar :index="index" :pokedex="pokedex" @select-pokemon="selectPokemon" />
    <Organizer :pokemon="selectedPokemon" :pokedex="pokedex" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Pokemon from '@/models/pokemon.model';
import LocalDataService from '@/services/LocalData.service';
import Header from '@/components/Header.vue';
import SearchBar from '@/components/SearchBar.vue';
import Organizer from '@/components/Organizer.vue';

@Options({
  components: {
    Header,
    SearchBar,
    Organizer,
  },
})
export default class App extends Vue {
    private index: Array<Record<string, string>> = [];
    private pokedex: Array<Pokemon> = [];
    private selectedPokemon: Pokemon | null = null;

    mounted() {
        this.getIndex()
        this.getPokedex()
    }

    private getIndex() {
        LocalDataService.getIndex().then(response => {
            const indexList: Array<Record<string, string>> = []
            const data = response.data
            for (const key in data) {
                indexList.push({'id': data[key], 'name': key})
            }
            this.index = indexList
        })
    }

    private getPokedex() {
        LocalDataService.getPokedex().then(response => {
            const pokedexList: Array<Pokemon> = []
            const data = response.data
            for (const key in data) {
                pokedexList.push(data[key])
            }
            this.pokedex = pokedexList
        })
    }

    public selectPokemon(pokemon: Pokemon) {
        this.selectedPokemon = pokemon
    }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#container {
  @apply max-w-2xl mx-auto;
  @apply flex flex-col h-screen;
}
</style>
