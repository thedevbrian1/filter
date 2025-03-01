import { Moon, Settings, Sun } from "lucide-react";
import type { Route } from "./+types/home";
import {
  data,
  Form,
  NavLink,
  redirect,
  useFetcher,
  // useLoaderData,
  useNavigation,
} from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Theme, Themed, useTheme } from "~/utils/themeProvider";
import { Button } from "~/components/ui/button";
import { act, useEffect, useRef, useState } from "react";
// import { themeStorage } from "~/utils/theme.server";
import { commitSession, getSession } from "~/utils/session.server";
import { flushSync } from "react-dom";

export const images = [
  "https://remix.run/blog-images/headers/the-future-is-now.jpg",
  "https://remix.run/blog-images/headers/waterfall.jpg",
  "https://remix.run/blog-images/headers/webpack.png",
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  let choice = new URL(request.url).searchParams.get("choice");
  let page = new URL(request.url).searchParams.get("page") ?? "1";

  // let session = await themeStorage.getSession(request.headers.get("Cookie"));
  let session = await getSession(request.headers.get("Cookie"));

  let themeChoice = session.get("user-choice");
  let items = session.get("items");

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

  return { filteredList, themeChoice, items, page };
}

export async function action({ request }: Route.ActionArgs) {
  // const session = await themeStorage.getSession(request.headers.get("Cookie"));
  let session = await getSession(request.headers.get("Cookie"));
  let page = Number(new URL(request.url).searchParams.get("page") ?? "1");

  let formData = await request.formData();
  let action = String(formData.get("_action"));
  let type = String(formData.get("type"));

  let nextPage = page + (action === "next" ? 1 : -1);

  if (type === "multistep") {
    return redirect(`?page=${nextPage}`, {
      headers: {
        // "Set-Cookie": await themeStorage.commitSession(session),
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  if (action === "s") {
    return null;
  } else if (action === "item") {
    let item = String(formData.get("item"));
    let itemsArray = session.get("items") ?? [];
    itemsArray.push(item);

    session.set("items", itemsArray);
    return data(
      { ok: true },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

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

export default function Home({ loaderData }: Route.ComponentProps) {
  let { filteredList, themeChoice, items, page } = loaderData;
  const [theme, setTheme] = useTheme();
  // let [selectedTheme, setSelectedTheme] = useState(theme);

  let themeFetcher = useFetcher();

  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";

  let isOptimistic =
    navigation.state !== "idle" && navigation.formData?.get("item");

  let [count, setCount] = useState(0);
  let [isShowing, setIsShowing] = useState(false);

  let itemFormRef = useRef(null);
  // const toggleTheme = () => {
  //   setTheme((prevTheme) =>
  //     prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
  //   );
  // };

  useEffect(() => {
    if (!isSubmitting) {
      itemFormRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <div className="p-6">
      <Form method="post" viewTransition className="cool-form">
        <input type="hidden" name="type" value="multistep" />
        <fieldset>
          {Number(page) === 1 ? (
            <div className="space-y-4">
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Brian"
                  className="border border-gray-500 px-2 py-3 rounded-lg block mt-2"
                />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  name="phone"
                  placeholder="0712 345 678"
                  className="border border-gray-500 px-2 py-3 rounded-lg block mt-2"
                />
              </label>
            </div>
          ) : Number(page) === 2 ? (
            <div>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="brian@email.com"
                  className="border border-gray-500 px-2 py-3 rounded-lg block mt-2"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  className="border border-gray-500 px-2 py-3 rounded-lg block mt-2"
                />
              </label>
            </div>
          ) : null}

          <div className="mt-4">
            {Number(page) === 1 ? (
              <button
                type="submit"
                name="_action"
                value="next"
                className="bg-amber-700 hover:bg-amber-500 px-4 py-2 rounded-lg"
              >
                Next
              </button>
            ) : Number(page) === 2 ? (
              <div className="flex gap-2">
                <button
                  type="submit"
                  name="_action"
                  value="back"
                  className="bg-white px-4 py-2 rounded-lg text-black"
                >
                  Back
                </button>
                <button
                  type="submit"
                  name="_action"
                  value="submit"
                  className="bg-green-700 px-4 py-2 rounded-lg"
                >
                  Submit
                </button>
              </div>
            ) : null}
          </div>
        </fieldset>
      </Form>
      {/* <ul className="flex gap-2 image-list">
        {images.map((item, index) => (
          <li key={index} className="aspect-square w-40">
            <NavLink to={`/images/${index}`} viewTransition>
              <img src={item} alt="" className="w-full h-full object-cover" />
            </NavLink>
          </li>
        ))}
      </ul> */}
      {/* <button onClick={toggleTheme}>Toggle</button> */}
      {/* FIXME: Synchronize the theme that the user selected with the current theme on first render */}
      {/* <button
        className="bg-pink-700 hover:bg-pink-500 px-4 py-2 rounded-lg"
        onClick={() => {
          document.startViewTransition(() => {
            flushSync(() => setCount((prev) => prev + 1));
          });
          // setCount((prev) => prev + 1);
          // setIsShowing((prev) => !prev);
        }}
      >
        Increment
      </button> */}
      {/* <div
        className="text-3xl mt-4 count-display"
      >
        {count}
      </div> */}

      <Form method="post" viewTransition className="mt-20">
        <button
          name="_action"
          value="s"
          className="btn-transition bg-green-700 hover:bg-green-500 px-4 py-2 rounded-lg"
          style={{ inlineSize: isSubmitting ? "120px" : "80px" }}
        >
          {isSubmitting ? "Submitting..." : "Send"}
        </button>
      </Form>
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
        {/* <Form method="post" ref={itemFormRef} viewTransition>
          <input type="hidden" name="_action" value="item" />
          <label>
            Item
            <input type="text" name="item" className="block p-3 bg-gray-500" />
          </label>
        </Form>
        <h2>Items</h2>
        <ul>
          {items?.map((item, index) => (
            <li key={index} style={{ viewTransitionName: `item-${index}` }}>
              {item}
            </li>
          ))}
          {isOptimistic ? (
            <li style={{ viewTransitionName: "item-optimistic" }}>
              {navigation.formData?.get("item")}
            </li>
          ) : null}
        </ul> */}
        {/* <h1 className="dark:text-red-500">Restaurant</h1>
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
        </ul> */}
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
