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

export interface GameVersion {
  name: string;
  names: Record<string, string>;
}

export interface VersionGroup {
  id: number;
  name: string;
  order: number;
  generation: string | null;
  regions: string[];
  pokedexes: string[];
  versions: GameVersion[];
}

export interface LocationArea {
  id: number;
  names: Record<string, string>;
}

export default Pokemon;
