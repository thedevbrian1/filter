import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/movie";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { flushSync } from "react-dom";

export async function loader({ params }: Route.LoaderArgs) {
  let id = Number(params.id);
  let res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkY2E1ODczYjUyYjAzNzgzMzc2NWI3OTFhZTIxODMyZCIsIm5iZiI6MTcxMDIzMDIzNC44NDMwMDAyLCJzdWIiOiI2NWYwMGFkYTFmNzQ4YjAxODQ1MWE2NDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WECXlO6pMlGSj_UfPJ3DzJkmSol1ArYgdmKneIhi174",
    },
  });

  let movie = await res.json();

  return movie;
}

export default function Movie({ loaderData }: Route.ComponentProps) {
  console.log({ movie: loaderData });
  let navigate = useNavigate();

  let [isHovered, setIsHovered] = useState(false);

  return (
    <main className="px-6 pb-8 max-w-6xl mx-auto mt-20 movie-detail">
      {/* <Link
        to="/movies"
        prefetch="intent"
        preventScrollReset
        className="flex gap-2 items-center"
        viewTransition
      >
        <ArrowLeft /> Back to movies
      </Link> */}
      <Button
        className={`flex gap-2 hover:gap-4 active:scale-[.97] focus-visible:border-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-rose-700 transition-all ease-in-out duration-300 items-center`}
        variant="outline"
        onClick={() => navigate(-1)}
        // onMouseEnter={(e) => {
        //   document.startViewTransition(() => {
        //     flushSync(() => setIsHovered(true));
        //   });
        // }}
        // onMouseLeave={(e) => {
        //   document.startViewTransition(() => {
        //     flushSync(() => setIsHovered(false));
        //   });
        // }}
      >
        <ArrowLeft /> Back to movies
      </Button>
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="lg:order-2">
          <h1 className="font-bold text-5xl">{loaderData.title}</h1>
          <span className="flex gap-2 items-center mt-4 text-amber-300">
            <Star /> {loaderData.vote_average.toFixed(2)}
          </span>
          <p
            className="mt-4 text-gray-300"
            // style={{ viewTransitionName: "details" }}
          >
            {loaderData.overview}
          </p>
        </div>
        <img
          src={`https://image.tmdb.org/t/p/w500${loaderData.poster_path}`}
          alt={`Poster for ${loaderData.title}`}
          className="lg:order-1 w-full aspect-[3/4] object-cover rounded-lg"
        />
      </div>
    </main>
  );
}
