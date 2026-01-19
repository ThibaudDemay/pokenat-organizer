export interface Pokemon {
  id: number;
  name: string;
  names: Record<string, string>;
  pokedex: Record<string, number>;
  sprite: string;
}

export interface PokedexInfo {
  id: number;
  name: string;
  names: Record<string, string>;
  region: string | null;
  count: number;
}

export default Pokemon;
