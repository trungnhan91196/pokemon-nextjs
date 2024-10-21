
export interface IPokemonList {
  count:number;
  results: IPokemon[];
}
export interface IPokemon {
  name: string;
  url: string;
}
