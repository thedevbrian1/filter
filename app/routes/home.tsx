import { Moon, Settings, Sun } from "lucide-react";
import type { Route } from "./+types/home";
import { data, Form, useFetcher, useLoaderData } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Theme, Themed, useTheme } from "~/utils/themeProvider";
import { Button } from "~/components/ui/button";
import { useState } from "react";
// import { themeStorage } from "~/utils/theme.server";
import { commitSession, getSession } from "~/utils/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  let choice = new URL(request.url).searchParams.get("choice");

  // let session = await themeStorage.getSession(request.headers.get("Cookie"));
  let session = await getSession(request.headers.get("Cookie"));

  let themeChoice = session.get("user-choice");

  console.log({ themeChoice });

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

  return { filteredList, themeChoice };
}

export async function action({ request }: Route.ActionArgs) {
  // const session = await themeStorage.getSession(request.headers.get("Cookie"));
  let session = await getSession(request.headers.get("Cookie"));

  let formData = await request.formData();
  let userChoice = String(formData.get("userChoice"));
  console.log({ userChoice });

  session.set("user-choice", userChoice);

  return data(
    { ok: true },
    {
      headers: {
        // "Set-Cookie": await themeStorage.commitSession(session),
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function Home() {
  let { filteredList, themeChoice } = useLoaderData();
  const [theme, setTheme] = useTheme();
  // let [selectedTheme, setSelectedTheme] = useState(theme);

  let themeFetcher = useFetcher();

  // const toggleTheme = () => {
  //   setTheme((prevTheme) =>
  //     prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
  //   );
  // };
  return (
    <div className="p-6">
      {/* <button onClick={toggleTheme}>Toggle</button> */}
      <themeFetcher.Form>
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
              ) : null}{" "}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                setTheme(Theme.LIGHT);
                // setSelectedTheme(Theme.LIGHT);
                themeFetcher.submit(
                  { userChoice: Theme.LIGHT },
                  { method: "POST" }
                );
              }}
              className={`${themeChoice === Theme.LIGHT ? "text-red-500" : ""}`}
            >
              <Sun
                className={`${
                  themeChoice === Theme.LIGHT ? "text-current" : ""
                } h-[1.2rem] w-[1.2rem] rotate-0 transition-all`}
              />{" "}
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setTheme(Theme.DARK);
                // setSelectedTheme(Theme.DARK);
                themeFetcher.submit(
                  { userChoice: Theme.DARK },
                  { method: "POST" }
                );
              }}
              className={`${themeChoice === Theme.DARK ? "text-red-500" : ""}`}
            >
              <Moon
                className={`${
                  themeChoice === Theme.DARK ? "text-current" : ""
                } h-[1.2rem] w-[1.2rem] transition-all`}
              />{" "}
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setTheme(Theme.SYSTEM);
                // setSelectedTheme(Theme.SYSTEM);
                themeFetcher.submit(
                  { userChoice: Theme.SYSTEM },
                  { method: "POST" }
                );
              }}
              className={`${
                themeChoice === Theme.SYSTEM ? "text-red-500" : ""
              }`}
            >
              <Settings
                className={`${
                  themeChoice === Theme.SYSTEM ? "text-current" : ""
                } h-[1.2rem] w-[1.2rem] transition-all`}
              />{" "}
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </themeFetcher.Form>
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
          {filteredList.map((item, index) => (
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
