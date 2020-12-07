
/* Exemple Data

{
    "names": {
        "fr": "bulbizarre",
        "en": "bulbasaur"
    },
    "pokedex": {
        "national": "1",
        "kanto": "1",
        "original-johto": "226",
        "updated-johto": "231",
        "kalos-central": "80",
        "isle-of-armor": "68",
        "updated-kanto": "1"
    },
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
}

*/

class Pokemon {
    public id: number;
    public name: string;
    public names: Record<string, string>;
    public pokedex: Record<string, number>;
    public sprite: string;

    constructor(id: number, name: string, names: Record<string, string>, pokedex: Record<string, number>, sprite: string) {
        this.id = id
        this.name = name
        this.names = names
        this.pokedex = pokedex
        this.sprite = sprite
    }
}

export default Pokemon;