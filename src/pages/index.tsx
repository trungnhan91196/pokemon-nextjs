import { IPokemon, IPokemonList } from "@/type/pokemon";
import { useEffect, useMemo, useState } from "react";
import Image from 'next/image';
import { PAGE_LIMIT } from "@/public/constant";
import { GetStaticProps } from "next";
import ImageLoader from "@/components/ImageLoader";
import { getID } from "@/public/common";

interface PageProps {
  pokemonList: IPokemonList;
  typeList: IPokemonList;
}

export default function Page({ pokemonList, typeList }: PageProps) {
  const [isLoading, setIsloading] = useState(true);
  const [data, setData] = useState<IPokemon[]>();
  const [dataType, setDataType] = useState<IPokemon[]>();
  const [page, setPage] = useState(1);
  const [listTypeSelect, setListTypeSelect] = useState<string[]>([]);
  const [dataFilter, setDataFilter] = useState<string[]>([]);
  const offset = useMemo(() => {
    return PAGE_LIMIT * page - PAGE_LIMIT
  }, [page]);

  const fetchMorePokemon = async () => {
    try {
      setIsloading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemon?offset=${offset}&limit=${PAGE_LIMIT}`);
      const result = await res.json();
      if (!!result.results?.length) {
        setData(result.results);
      }
      setIsloading(false);
    } catch (error) {
      console.log('Failed to fetch data', error);
    } finally {
      setIsloading(false);
    }
  }

  const handleClickNext = () => {
    setPage(pre => pre + 1);
    var element = document.getElementById("mainview");

    element?.scrollIntoView({ behavior: "smooth" });
  }

  async function getPokemonByType(pokemonType: string): Promise<Set<{ pokemon: IPokemon }>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/type/${pokemonType}`);
    const data = await response.json();
    const pokemonSet = new Set<{ pokemon: IPokemon }>(
      data.pokemon
    )
    return pokemonSet;
  }

  async function getCombinedPokemon(types: string[]): Promise<Set<{ name: string, url: string }>> {
    const combinedPokemon = new Set<{ name: string, url: string }>();
    for (const type of types) {
      const pokemonByType = await getPokemonByType(type);
      pokemonByType.forEach((val) => combinedPokemon.add({ name: val.pokemon.name, url: val.pokemon.url }));
    }
    return combinedPokemon;
  }


  const handleSelectType = (value: string) => {
    if (listTypeSelect.includes(value)) {
      setListTypeSelect(listTypeSelect.filter(x => x !== value))
    } else {
      setListTypeSelect(pre => [...pre, value]);
    }
  }

  useEffect(() => {
    const getPokemonByFilterData = async () => {
      for (const name of dataFilter) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemon/${name}/`);
        const result = res.json();
      }
    }
    getPokemonByFilterData();
  }, [dataFilter])


  useEffect(() => {
    const getPokeByType = async () => {
      if (listTypeSelect?.length) {
        const combinedPokemon = await getCombinedPokemon(listTypeSelect);
        let arr: IPokemon[] = []
        combinedPokemon.forEach((pokemon) => {
          console.log('pokemon', pokemon);
          arr.push(pokemon)
        })
        setData(arr);
      }
    }
    getPokeByType();
  }, [listTypeSelect])
  console.log(`Combined Pokémon for types`, data);
  useEffect(() => {
    if (pokemonList?.results.length) {
      setData(pokemonList?.results);
      setIsloading(false);
    }
  }, [pokemonList])

  useEffect(() => {
    if (typeList?.results?.length) {
      setDataType(typeList?.results);
      setIsloading(false);
    }
  }, [typeList])

  useEffect(() => {
    if (!!page)
      fetchMorePokemon();
  }, [page])

  return <div
    className="pokemon-list wrapper p-5"
  >
    <div id="mainview" className="type-filter items-start flex w-full mb-10">
      <div><b>Types:</b></div>
      <div className="flex w-full justify-center gap-4 flex-wrap items-center">
        {dataType && dataType.map((x, idx) => {
          return <div className={`type-single p-2  rounded-md border-[#7F1D1D] text-[#7F1D1D] font-semibold border-2 ${listTypeSelect.includes(x.name) ? 'bg-[#7F1D1D] text-white' : ''}`} key={`type-${idx}`}
            onClick={() => handleSelectType(x.name)}
          >{x.name}</div>
        })}
      </div>
    </div>
    <div><b>{`${pokemonList.count} results found`}</b></div>
    <div className="main-content ">
      {isLoading ? <div className="flex justify-center items-center min-h-[300px] w-full"><Image alt='spinner' width={100} height={100} src={require('@/public/assets/spin.gif')} /></div> : (
        data?.length ?
          <div className="main-content-pokemon grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {data?.map((x: IPokemon, idx) => {
              const id = getID(x.url) ?? 1;
              return <div key={idx} className="item-single min-w-[120px] flex items-center justify-center flex-col">
                <ImageLoader altText={`${x.name}`} imageUrl={`${process.env.NEXT_PUBLIC_AVATAR_IMAGE_PREFIX_URL}/${id}.png`} />
                <div className="pokemon-name">{x.name}</div>
              </div>
            })}
          </div>
          : <div className="text-lg font-semibold flex justify-center w-full ">No data found</div>
      )
      }
    </div>
    {!listTypeSelect.length && <div className="button-wrap w-full justify-center flex gap-2 mt-8">
      <button
        className="btn-pre bg-[#7F1D1D] text-white p-2 rounded-md disabled:opacity-40"
        disabled={page === 1}
        onClick={() => {
          setPage(pre => pre - 1)
        }
        }>Prev</button>
      <button
        className="btn-next bg-[#7F1D1D] text-white p-2 rounded-md"
        onClick={handleClickNext}>Next</button>
    </div>}
  </div>
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemon?limit=${PAGE_LIMIT}`)
    const pokemonList = await res.json();
    const typeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/type?limit=99`)
    const typeList = await typeRes.json();
    return {
      props: {
        pokemonList,
        typeList,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        pokemonList: [], // Provide a fallback empty array or handle error as needed
        typeList: [], // Provide a fallback empty array or handle error as needed
      },
    };
  }
}