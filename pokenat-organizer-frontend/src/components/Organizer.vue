<template>
    <div id="organizer">
        <div>
            <nav id="box-nav">
                <button class="box-previous" v-on:click="changeBox(-1)">
                    <!-- Heroicon name: chevron-left -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="box-number"> Box {{currentBox + 1}}</div>
                <button class="box-next" v-on:click="changeBox(+1)">
                    <!-- Heroicon name: chevron-right -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </nav>
            <ul id="box">
                <li class="box-case" v-for="cp in getPokemonsInBox()" :style="boxCaseStyle()" :key="cp.id">
                    <div class="box-case-content" :class="{active: pokemon && cp.id == pokemon.id}">
                        <img v-if="cp.sprite" :src="cp.sprite" />
                        <div class="pokename" v-else-if="!cp.sprite">{{cp.names[lang]}}</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Pokemon from '@/models/pokemon.model';
import PokeapiDataService from '@/services/PokeapiData.service';

@Options({
    props: {
        pokemon: {
            required: true
        },
        pokedex: {
            type: Array,
            required: true
        },
        lang: {
            type: String,
            required: true
        }
    },
    watch: {
        'pokemon': {
            handler: 'onPokemonChanged'
        }
    }
})
export default class Organizer extends Vue {
    private currentBox: number = 0;
    private currentLine: number = 0;
    private currentCol: number = 0;
    private currentPos: number = 0;
    private nbCol: number = 6;
    private nbLine: number = 5;
    private pokemon!: Pokemon | null;
    private pokedex!: Array<Pokemon>;
    private lang!: string;
    private pokemonFromApi?: Pokemon;

    private onPokemonChanged() {
        this.getPokemon()
        this.calculate()
    }

    private getPokemon() {
        if (this.pokemon == undefined)
            return
        PokeapiDataService.getPokemon(this.pokemon.id).then(response => {
            const data = response.data
            this.pokemonFromApi = data
        })
    }

    private nbByBox(): number {
        return this.nbCol * this.nbLine
    }

    private boxCaseStyle(): Record<string, string> {
        return {
            width: 100/this.nbCol + "%"
        }
    }

    private getPokemonsInBox(): Array<Pokemon> {
        const start = this.currentBox * this.nbByBox()
        const end = start + this.nbByBox()
        return this.pokedex.slice(start, end)
    }

    private calculate() {
        if (this.pokemon == undefined)
            return
        const workId = this.pokemon.id - 1
        this.currentBox = ~~(workId / this.nbByBox())
        this.currentPos = workId - (this.nbByBox() * ~~(workId / this.nbByBox()))
        this.currentLine = ~~(this.currentPos / this.nbCol)
        this.currentCol = this.currentPos - (this.nbCol * this.currentLine)
    }

    private changeBox(delta: number) {
        if (delta < 0 && this.currentBox == 0)
            return
        this.currentBox = this.currentBox + delta
    }

}
</script>

<style lang="scss">

#organizer {
    @apply flex-1 overflow-y-auto;

    nav#box-nav {
        @apply flex my-1 px-1 h-10 items-center;
        @apply bg-gray-300 rounded;

        button.box-previous, button.box-next {
            @apply flex-none h-10 w-20;
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
        @apply bg-green-100 rounded;
        > li.box-case {
            @apply flex p-2;
            @apply bg-white bg-opacity-50;

            > .box-case-content {
                @apply flex flex-grow justify-center items-center;
                @apply rounded;
                @apply bg-white bg-opacity-50;

                &.active {
                    @apply bg-red-900 bg-opacity-50;
                }
            }

        }
    }
}

</style>