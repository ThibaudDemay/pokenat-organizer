<template>
    <div id="organizer">
        <div v-if="pokemon != undefined">
            <p>
                Pokemon: {{pokemon.names['fr']}} [{{pokemon.id}}]<br />
                Current box : {{currentBox}}<br />
                Pokemon in Box: {{currentPos}} [{{currentLine}}][{{currentCol}}]
            </p>
            <ul id="box">
                <li class="box-case" v-for="cp in getPokemonsInBox()" :style="boxCaseStyle()" :key="cp.id">
                    <div class="box-case-content" :class="{active: cp.id == pokemon.id}">
                        <img v-if="cp.sprite" :src="cp.sprite" />
                    </div>
                </li>
            </ul>
        </div>
        <div v-else-if="pokemon == undefined">
        No pokemon selected
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
   
}
</script>

<style lang="scss">

#organizer {
    @apply flex-1 overflow-y-auto;
    // @apply text-center;

    ul#box {
        @apply flex flex-wrap;
        @apply bg-green-100 rounded;
        > li.box-case {
            @apply flex p-2;
            @apply bg-white bg-opacity-50;

            > .box-case-content {

                &.active {
                    @apply bg-red-900 bg-opacity-50;
                }
            }

        }
    }
}

</style>