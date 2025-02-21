import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Form, useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }) {
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
  return (
    <div className="p-6">
      <h1>Restaurant</h1>
      <Form>
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
  );
}
