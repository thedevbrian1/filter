import { Form, Link, NavLink, useSearchParams, useSubmit } from "react-router";
import type { Route } from "./+types/movies";
import { Star } from "lucide-react";

export async function loader({ params, request }: Route.LoaderArgs) {
  let userGenres = new URL(request.url).searchParams.getAll("genre");

  console.log({ userGenres });

  let genreRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, {
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkY2E1ODczYjUyYjAzNzgzMzc2NWI3OTFhZTIxODMyZCIsIm5iZiI6MTcxMDIzMDIzNC44NDMwMDAyLCJzdWIiOiI2NWYwMGFkYTFmNzQ4YjAxODQ1MWE2NDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WECXlO6pMlGSj_UfPJ3DzJkmSol1ArYgdmKneIhi174",
    },
  });

  let { genres } = await genreRes.json();
  console.log({ genres });

  let matchedGenres = userGenres.map((item) => {
    let match = genres.find((genre) => genre.name.toLowerCase() === item);
    return match;
  });

  console.log({ matchedGenres });

  let genreIds = matchedGenres.map((item) => item.id);
  console.log({ genreIds });
  let genreQuery = genreIds.join();
  console.log({ genreQuery });

  let res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?with_genres=${genreQuery}`,
    {
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkY2E1ODczYjUyYjAzNzgzMzc2NWI3OTFhZTIxODMyZCIsIm5iZiI6MTcxMDIzMDIzNC44NDMwMDAyLCJzdWIiOiI2NWYwMGFkYTFmNzQ4YjAxODQ1MWE2NDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WECXlO6pMlGSj_UfPJ3DzJkmSol1ArYgdmKneIhi174",
      },
    }
  );
  let movies = await res.json();

  return movies;
}

export default function Movies({ loaderData }: Route.ComponentProps) {
  console.log({ movies: loaderData });

  let submit = useSubmit();
  let [searchParams] = useSearchParams();
  let genres = searchParams.getAll("genre");

  return (
    <main className="px-6 pb-16 max-w-6xl mx-auto mt-20">
      <h1 className="font-bold text-5xl">Movies</h1>
      <Form className="mt-4">
        <fieldset>
          <legend className="text-gray-400">Select one or more genres</legend>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex gap-2">
              <input
                type="checkbox"
                name="genre"
                value="action"
                id="action"
                defaultChecked={genres.includes("action")}
                onChange={(e) =>
                  submit(e.currentTarget.form, {
                    viewTransition: true,
                    preventScrollReset: true,
                  })
                }
                className="peer appearance-none"
              />
              <label
                htmlFor="action"
                className="bg-gray-500 peer-checked:bg-orange-500 peer-focus-visible:border-none peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-rose-700 peer-focus-visible:ring-offset-2 active:scale-[.97] transition ease-in-out duration-300 px-4 py-2 rounded-md"
              >
                Action
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                name="genre"
                value="comedy"
                id="comedy"
                defaultChecked={genres.includes("comedy")}
                onChange={(e) =>
                  submit(e.currentTarget.form, {
                    viewTransition: true,
                    preventScrollReset: true,
                  })
                }
                className="peer appearance-none"
              />
              <label
                htmlFor="comedy"
                className="bg-gray-500 peer-checked:bg-orange-500 peer-focus-visible:border-none peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-rose-700 peer-focus-visible:ring-offset-2 active:scale-[.97] transition ease-in-out duration-300 px-4 py-2 rounded-md"
              >
                Comedy
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                name="genre"
                value="thriller"
                id="thriller"
                defaultChecked={genres.includes("thriller")}
                onChange={(e) =>
                  submit(e.currentTarget.form, {
                    viewTransition: true,
                    preventScrollReset: true,
                  })
                }
                className="peer appearance-none"
              />
              <label
                htmlFor="thriller"
                className="bg-gray-500 peer-checked:bg-orange-500 peer-focus-visible:border-none peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-rose-700 peer-focus-visible:ring-offset-2 active:scale-[.97] transition ease-in-out duration-300 px-4 py-2 rounded-md"
              >
                Thriller
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                name="genre"
                value="drama"
                id="drama"
                defaultChecked={genres.includes("drama")}
                onChange={(e) =>
                  submit(e.currentTarget.form, {
                    viewTransition: true,
                    preventScrollReset: true,
                  })
                }
                className="peer appearance-none"
              />
              <label
                htmlFor="drama"
                className="bg-gray-500 peer-checked:bg-orange-500 peer-focus-visible:border-none peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-rose-700 peer-focus-visible:ring-offset-2 active:scale-[.97] transition ease-in-out duration-300 px-4 py-2 rounded-md"
              >
                Drama
              </label>
            </div>
          </div>
        </fieldset>
      </Form>
      <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
        {loaderData.results.map((item) => {
          function prefetchImage() {
            let img = new Image();
            img.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
          }
          return (
            <li
              key={item.id}
              className="cool-item hover:scale-105 transition ease-in-out duration-300"
              style={{ viewTransitionName: `movie-${item.id}` }}
            >
              <NavLink
                to={`/movies/${item.id}`}
                prefetch="intent"
                viewTransition
                className="flex flex-col gap-4 focus-visible:border-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-rose-700"
                onMouseEnter={prefetchImage}
                onFocus={prefetchImage}
              >
                <div className="order-2">
                  <h2>{item.title}</h2>
                  <span className="flex gap-2 items-center mt-2 text-amber-300">
                    <Star /> {item.vote_average.toFixed(2)}
                  </span>
                </div>
                <div className="h-72 aspect-[9/16]  order-1">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
