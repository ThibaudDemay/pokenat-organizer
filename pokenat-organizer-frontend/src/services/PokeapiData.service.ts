
import axios, { AxiosInstance } from "axios"

class PokeapiDataService {
    axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: "http://pokeapi.co/api/v2",
            headers: {
                "Content-type": "application/json"
            }
        })
    }

    getPokedex() {
        return this.axios.get('/pokedex/')
    }

    getPokemon(id: number) {
        return this.axios.get(`/pokemon/${id}`)
    }

    getPokemonSpecies(id: number) {
        return this.axios.get(`/pokemon-species/${id}`)
    }
}

export default new PokeapiDataService();