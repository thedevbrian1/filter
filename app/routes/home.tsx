import { Check, CircleCheckBig, Moon, Settings, Sun } from "lucide-react";
import type { Route } from "./+types/home";
import {
  data,
  Form,
  Link,
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
import { useSpinDelay } from "spin-delay";

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

  let page1Data = session.get("page1Data") ?? {};
  let page2Data = session.get("page2Data") ?? {};
  let page3Data = session.get("page3Data") ?? {};

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

  return {
    filteredList,
    themeChoice,
    items,
    page,
    page1Data,
    page2Data,
    page3Data,
  };
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
    switch (page) {
      case 1: {
        let name = String(formData.get("name"));
        let phone = String(formData.get("phone"));

        let page1Data = {
          name,
          phone,
        };

        session.set("page1Data", page1Data);
        break;
      }
      case 2: {
        let email = String(formData.get("email"));
        let password = String(formData.get("password"));

        let page2Data = { email, password };

        session.set("page2Data", page2Data);
        break;
      }
      case 3: {
        let terms = String(formData.get("terms"));
        console.log({ terms });

        if (action === "back") {
          let page3Data = {
            terms,
          };

          if (terms === "on") {
            session.set("page3Data", page3Data);
          }
          break;
        }

        session.unset("page1Data");
        session.unset("page2Data");
        session.unset("page3Data");

        return data(
          { id: 1 },
          {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          }
        );
      }
    }
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

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  let {
    filteredList,
    themeChoice,
    items,
    page,
    page1Data,
    page2Data,
    page3Data,
  } = loaderData;

  console.log({ terms: page3Data.terms });

  let id;

  if (actionData && typeof actionData === "object" && "id" in actionData) {
    id = actionData.id;
  }

  const [theme, setTheme] = useTheme();
  // let [selectedTheme, setSelectedTheme] = useState(theme);

  let themeFetcher = useFetcher();

  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";

  let isOptimistic =
    navigation.state !== "idle" && navigation.formData?.get("item");

  let showLoader = useSpinDelay(isSubmitting, {
    delay: 150,
    minDuration: 500,
  });

  let [clicked, setIsClicked] = useState(false);

  let [count, setCount] = useState(0);
  let [isShowing, setIsShowing] = useState(false);

  let itemFormRef = useRef(null);
  // const toggleTheme = () => {
  //   setTheme((prevTheme) =>
  //     prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
  //   );
  // };

  let steps = [
    {
      title: "Personal info",
      step: 1,
    },
    {
      title: "Account info",
      step: 2,
    },
    {
      title: "Complete",
      step: 3,
    },
  ];

  useEffect(() => {
    if (!isSubmitting) {
      itemFormRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <div className="p-6">
      <div className="bg-[#1b1f2f] max-w-fit mx-auto mt-20 p-10 rounded-lg">
        <div className="subscribe">
          <div className="" aria-hidden={!!id}>
            <h1 className="text-3xl font-bold">Signup</h1>

            <ol className="flex gap-4 mt-8">
              {steps.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-2 ${
                    item.step === Number(page)
                      ? "text-gray-100 relative after:absolute after:-bottom-1 after:left-10 after:right-0 after:h-0.5  after:bg-gray-100"
                      : item.step < Number(page)
                      ? "text-green-500"
                      : "text-gray-500"
                  } ${isSubmitting ? "cool-li" : ""}`}
                  // style={{ viewTransitionName: `step-${index}` }}
                >
                  {/* {item.step < Number(page) ? <Check /> : <>&nbsp;</>}{" "} */}
                  <span
                    className={`w-8 h-8 rounded-full border grid place-items-center ${
                      item.step === Number(page)
                        ? "border-gray-200"
                        : item.step < Number(page)
                        ? "border-green-500"
                        : "border-gray-500"
                    }`}
                  >
                    {" "}
                    {item.step < Number(page) ? <Check /> : `${index + 1}`}{" "}
                  </span>
                  {item.title}
                </li>
              ))}
            </ol>
            <Form
              method="post"
              viewTransition
              className="cool-form mt-8"
              preventScrollReset
            >
              <input type="hidden" name="type" value="multistep" />
              <fieldset>
                {Number(page) === 1 ? (
                  <div className="flex flex-col gap-4">
                    <label className="">
                      Name
                      <input
                        key={"name"}
                        type="text"
                        name="name"
                        placeholder="Brian"
                        defaultValue={page1Data?.name || ""}
                        className="border border-gray-500 px-2 py-3 rounded-lg block mt-2 w-full"
                      />
                    </label>
                    <label className="">
                      Phone
                      <input
                        key={"phone"}
                        type="text"
                        name="phone"
                        placeholder="0712 345 678"
                        defaultValue={page1Data?.phone || ""}
                        className="border border-gray-500 px-2 py-3 rounded-lg block mt-2 w-full"
                      />
                    </label>
                  </div>
                ) : Number(page) === 2 ? (
                  <div className="flex flex-col gap-4">
                    <label>
                      Email
                      <input
                        key={"email"}
                        type="email"
                        name="email"
                        placeholder="brian@email.com"
                        autoComplete="new-password"
                        defaultValue={page2Data?.email}
                        className="border border-gray-500 px-2 py-3 rounded-lg block mt-2 w-full"
                      />
                    </label>

                    <label>
                      Password
                      <input
                        key={"password"}
                        type="password"
                        name="password"
                        defaultValue={page2Data?.password}
                        className="border border-gray-500 px-2 py-3 rounded-lg block mt-2 w-full"
                      />
                    </label>
                  </div>
                ) : Number(page) === 3 ? (
                  <label className="flex gap-2 items-center">
                    {/* <textarea
                  name="message"
                  className="block border border-gray-500 px-2 py-3 rounded-lg mt-2"
                ></textarea> */}
                    <input
                      type="checkbox"
                      name="terms"
                      defaultChecked={page3Data.terms}
                    />
                    I agree to the terms and conditions
                  </label>
                ) : null}

                <div className="mt-4 flex gap-2">
                  {Number(page) !== 1 ? (
                    <button
                      type="submit"
                      name="_action"
                      value="back"
                      className="bg-white px-4 py-2 rounded-lg text-black active:scale-[.97]"
                    >
                      Back
                    </button>
                  ) : null}
                  {Number(page) !== 3 ? (
                    <button
                      type="submit"
                      name="_action"
                      value="next"
                      className="bg-amber-700 hover:bg-amber-500 px-4 py-2 rounded-lg active:scale-[.97]"
                    >
                      {showLoader &&
                      navigation.formData?.get("_action") === "next"
                        ? "Processing..."
                        : "Next"}
                      {/* <span className="text-white w-10">
                        <ThreeDots />
                      </span> */}
                    </button>
                  ) : null}

                  {Number(page) === 3 ? (
                    <button
                      type="submit"
                      name="_action"
                      value="submit"
                      className="bg-green-700 px-4 py-2 rounded-lg active:scale-[.97]"
                    >
                      {showLoader &&
                      navigation.formData?.get("_action") === "submit"
                        ? "Processing..."
                        : "Complete"}
                    </button>
                  ) : null}
                </div>
              </fieldset>
            </Form>
          </div>
          <div
            aria-hidden={!id}
            className="text-center"
            style={{ viewTransitionName: "none" }}
          >
            <div className="flex justify-center text-green-400">
              <CircleCheckBig className="w-80" />
            </div>
            <h2 className="font-semibold text-4xl  mt-4">
              Signup was successful!
            </h2>
            <p className="mt-4 text-gray-300">
              Check your email to verify your account.
            </p>
            <div className="mt-8 has-[:active]:scale-[0.97] transition ease-out duration-300">
              <Link
                to="."
                preventScrollReset
                className="bg-purple-500 hover:bg-purple-700 active:scale-[.97] hover:bg-brand-light-purple text-white transition-colors ease-in-out duration-300  rounded-lg px-6 py-3"
              >
                Start over
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`box aspect-square bg-blue-500 w-40 mt-16 relative ${
          clicked ? "left-64 rotate-180" : ""
        }`}
        onClick={() => {
          document.startViewTransition({
            update: () => {
              flushSync(() => setIsClicked((prev) => !prev));
            },
            types: ["b"],
          });
        }}
        // style={{ viewTransitionName: "box" }}
      ></div>
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

      {/* <Form method="post" viewTransition className="mt-20">
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
      </themeFetcher.Form> */}
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

function ThreeDots() {
  return (
    <svg
      viewBox="0 0 120 30"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <circle cx="15" cy="15" r="15">
        <animate
          attributeName="r"
          from="15"
          to="15"
          begin="0s"
          dur="0.8s"
          values="15;9;15"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.5;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="15" r="9" fillOpacity="0.3">
        <animate
          attributeName="r"
          from="9"
          to="9"
          begin="0s"
          dur="0.8s"
          values="9;15;9"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="0.5"
          to="0.5"
          begin="0s"
          dur="0.8s"
          values=".5;1;.5"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="105" cy="15" r="15">
        <animate
          attributeName="r"
          from="15"
          to="15"
          begin="0s"
          dur="0.8s"
          values="15;9;15"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.5;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
