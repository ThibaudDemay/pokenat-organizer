import axios, { AxiosInstance } from "axios"

// Types pour les réponses de l'API
export interface PokemonApiResponse {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: {
        slot: number;
        type: { name: string; url: string };
    }[];
    stats: {
        base_stat: number;
        effort: number;
        stat: { name: string; url: string };
    }[];
    abilities: {
        ability: { name: string; url: string };
        is_hidden: boolean;
        slot: number;
    }[];
}

export interface PokemonSpeciesApiResponse {
    id: number;
    name: string;
    generation: { name: string; url: string };
    is_legendary: boolean;
    is_mythical: boolean;
    color: { name: string; url: string };
    habitat: { name: string; url: string } | null;
    evolves_from_species: { name: string; url: string } | null;
}

// Données enrichies combinées
export interface PokemonDetails {
    types: string[];
    height: number; // en décimètres
    weight: number; // en hectogrammes
    stats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
    abilities: { name: string; isHidden: boolean }[];
    generation: string;
    isLegendary: boolean;
    isMythical: boolean;
    color: string;
    habitat: string | null;
    evolvesFrom: string | null;
}

class PokeapiDataService {
    axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: "https://pokeapi.co/api/v2",
            headers: {
                "Content-type": "application/json"
            }
        })
    }

    getPokedex() {
        return this.axios.get('/pokedex/')
    }

    getPokemon(id: number) {
        return this.axios.get<PokemonApiResponse>(`/pokemon/${id}`)
    }

    getPokemonSpecies(id: number) {
        return this.axios.get<PokemonSpeciesApiResponse>(`/pokemon-species/${id}`)
    }

    async getPokemonDetails(id: number): Promise<PokemonDetails> {
        const [pokemonRes, speciesRes] = await Promise.all([
            this.getPokemon(id),
            this.getPokemonSpecies(id)
        ]);

        const pokemon = pokemonRes.data;
        const species = speciesRes.data;

        // Extraire les stats dans un objet nommé
        const statsMap: Record<string, number> = {};
        for (const stat of pokemon.stats) {
            statsMap[stat.stat.name] = stat.base_stat;
        }

        return {
            types: pokemon.types.map(t => t.type.name),
            height: pokemon.height,
            weight: pokemon.weight,
            stats: {
                hp: statsMap['hp'] || 0,
                attack: statsMap['attack'] || 0,
                defense: statsMap['defense'] || 0,
                specialAttack: statsMap['special-attack'] || 0,
                specialDefense: statsMap['special-defense'] || 0,
                speed: statsMap['speed'] || 0,
            },
            abilities: pokemon.abilities.map(a => ({
                name: a.ability.name,
                isHidden: a.is_hidden
            })),
            generation: species.generation.name,
            isLegendary: species.is_legendary,
            isMythical: species.is_mythical,
            color: species.color.name,
            habitat: species.habitat?.name || null,
            evolvesFrom: species.evolves_from_species?.name || null,
        };
    }
}

export default new PokeapiDataService();