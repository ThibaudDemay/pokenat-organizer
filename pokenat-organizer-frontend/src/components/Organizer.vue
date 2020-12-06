<template>
    <div id="organizer">
        <div v-if="id != 0">
        Pokemon: {{pokemon}}
        </div>
        <div v-else-if="id == 0">
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
        id: {
            type: Number,
            required: true
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
    private id!: number;
    private pokemon?: Pokemon;

    mounted() {
        this.getPokemon()
        this.calculate()
    }

    private getPokemon() {
        if (this.id == 0)
            return
        PokeapiDataService.getPokemon(this.id).then(response => {
            const data = response.data
            this.pokemon = data
        })
    }

    private nbByBox(): number {
        return this.nbCol * this.nbLine
    }

    private calculate() {
        if (this.id == 0)
            return
        const workId = this.id - 1
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
}

</style>