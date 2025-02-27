import { NavLink, Outlet } from "react-router";

export default function Events() {
  let navLinks = [
    {
      title: "All",
      path: "/",
      id: 1,
    },
    {
      title: "Sports",
      path: "/sports",
      id: 2,
    },
    {
      title: "Theatre",
      path: "/theatre",
      id: 3,
    },
    {
      title: "Concerts",
      path: "/concerts",
      id: 4,
    },
    {
      title: "Festivals",
      path: "/festivals",
      id: 5,
    },
  ];
  return (
    <main>
      <h1>Events</h1>
      <nav>
        <ul className="flex gap-2 event-list">
          {navLinks.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/events${item.path}`}
                end
                viewTransition
                // style={{ viewTransitionName: `link-${item.id}` }}
                className={({ isActive }) =>
                  `relative ${
                    isActive
                      ? "after:absolute after:right-0 after:left-0 after:h-1 after:-bottom-2 after:bg-red-500"
                      : ""
                  }`
                }
              >
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </main>
  );
}
