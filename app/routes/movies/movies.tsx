import { NavLink } from "react-router";
import type { Route } from "./+types/movies";
import { Star } from "lucide-react";

export async function loader() {
  let res = await fetch(`https://api.themoviedb.org/3/discover/movie`, {
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkY2E1ODczYjUyYjAzNzgzMzc2NWI3OTFhZTIxODMyZCIsIm5iZiI6MTcxMDIzMDIzNC44NDMwMDAyLCJzdWIiOiI2NWYwMGFkYTFmNzQ4YjAxODQ1MWE2NDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WECXlO6pMlGSj_UfPJ3DzJkmSol1ArYgdmKneIhi174",
    },
  });
  let movies = await res.json();

  return movies;
}

export default function Movies({ loaderData }: Route.ComponentProps) {
  console.log({ movies: loaderData });
  return (
    <main className="px-6 max-w-6xl mx-auto mt-20">
      <h1 className="font-bold text-5xl">Movies</h1>
      <ul className="grid lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
        {loaderData.results.map((item) => (
          <li
            key={item.id}
            className="cool-item hover:scale-105 transition ease-in-out duration-300"
          >
            <NavLink
              to={`/movies/${item.id}`}
              prefetch="intent"
              viewTransition
              className="flex flex-col gap-4"
            >
              <div className="order-2">
                <h2>{item.title}</h2>
                <span className="flex gap-2 items-center mt-2 text-amber-300">
                  <Star /> {item.vote_average.toFixed(2)}
                </span>
              </div>
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt=""
                className="h-60 w-full object-cover order-1"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
