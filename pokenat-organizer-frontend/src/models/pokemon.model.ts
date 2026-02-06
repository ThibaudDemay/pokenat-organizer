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

export interface VariantStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface PokemonVariant {
  id: number;
  name: string;
  names: Record<string, string>;
  sprite: string;
  versions: string[];
  isMega: boolean;
  isBattleOnly: boolean;
  types: string[];
  height: number;
  weight: number;
  stats: VariantStats;
}

export default Pokemon;
