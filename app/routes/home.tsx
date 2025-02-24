import { Moon, Settings, Sun } from "lucide-react";
import type { Route } from "./+types/home";
import { Form, useLoaderData } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Theme, Themed, useTheme } from "~/utils/themeProvider";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  let choice = new URL(request.url).searchParams.get("choice");

  let food = [
    {
      name: "Chocolate",
      category: "Snacks",
    },
    {
      name: "Tiramisu",
      category: "Pastery",
    },
    {
      name: "Cheese cake",
      category: "Pastery",
    },
    {
      name: "Coffee",
      category: "Beverages",
    },
    {
      name: "Soda",
      category: "Beverages",
    },
  ];

  // If one has selected a filter, return the filtered elements, else return all the food items
  let filteredList;

  if (choice) {
    filteredList = food.filter((item) => item.category === choice);
  } else {
    filteredList = food;
  }

  return filteredList;
}

export default function Home() {
  let food = useLoaderData();
  const [theme, setTheme] = useTheme();

  // const toggleTheme = () => {
  //   setTheme((prevTheme) =>
  //     prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
  //   );
  // };
  return (
    <div className="p-6">
      {/* <button onClick={toggleTheme}>Toggle</button> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-slate-800 grid place-items-center"
          >
            {theme === Theme.LIGHT ? (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            ) : theme === Theme.DARK ? (
              <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all" />
            ) : theme === Theme.SYSTEM ? (
              <Settings className="absolute h-[1.2rem] w-[1.2rem] transition-all" />
            ) : null}{" "}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setTheme(Theme.LIGHT)}
            className={`${theme === Theme.LIGHT ? "text-red-500" : ""}`}
          >
            <Sun
              className={`${
                theme === Theme.LIGHT ? "text-current" : ""
              } h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 `}
            />{" "}
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme(Theme.DARK)}
            className={`${theme === Theme.DARK ? "text-red-500" : ""}`}
          >
            <Moon
              className={`${
                theme === Theme.DARK ? "text-current" : ""
              } h-[1.2rem] w-[1.2rem] transition-all`}
            />{" "}
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme(Theme.SYSTEM)}
            className={`${theme === Theme.SYSTEM ? "text-red-500" : ""}`}
          >
            <Settings
              className={`${
                theme === Theme.SYSTEM ? "text-current" : ""
              } h-[1.2rem] w-[1.2rem] transition-all`}
            />{" "}
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="dark:bg-black">
        <h1 className="dark:text-red-500">Restaurant</h1>
        <Form viewTransition>
          <button className="bg-purple-500" name="choice" value="All">
            All
          </button>
          <button className="bg-green-500" name="choice" value="Pastery">
            Pastery
          </button>
          <button className="bg-orange-500" name="choice" value="Beverages">
            Beverages
          </button>
          <button className="bg-white text-black" name="choice" value="Snacks">
            Snacks
          </button>
        </Form>
        <ul className="mt-8">
          {food.map((item, index) => (
            <li key={index}>{item.name}</li>
          ))}
        </ul>
      </div>
      {/* <Themed
        dark={
          <div className="bg-slate-800">
            <h1>Restaurant</h1>
            <Form viewTransition>
              <button className="bg-purple-500" name="choice" value="All">
                All
              </button>
              <button className="bg-green-500" name="choice" value="Pastery">
                Pastery
              </button>
              <button className="bg-orange-500" name="choice" value="Beverages">
                Beverages
              </button>
              <button
                className="bg-white text-black"
                name="choice"
                value="Snacks"
              >
                Snacks
              </button>
            </Form>
            <ul className="mt-8">
              {food.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
            </ul>
          </div>
        }
        light={
          <div>
            <h1>Restaurant</h1>
            <Form viewTransition>
              <button className="bg-purple-500" name="choice" value="All">
                All
              </button>
              <button className="bg-green-500" name="choice" value="Pastery">
                Pastery
              </button>
              <button className="bg-orange-500" name="choice" value="Beverages">
                Beverages
              </button>
              <button
                className="bg-white text-black"
                name="choice"
                value="Snacks"
              >
                Snacks
              </button>
            </Form>
            <ul className="mt-8">
              {food.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
            </ul>
          </div>
        }
      /> */}
    </div>
  );
}
