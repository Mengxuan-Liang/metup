import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { restoreUser } from "./store/session";
import Navigation from "./components/Navigation/Navigation";
import Landing from "./components/Landing/Landing";
import AllGroups from "./components/AllGroups/AllGroups";
import AllEvents from "./components/AllEvents/AllEvents";
import OneGroup from "./components/OneGroup/OneGroup";
import OneEvent from "./components/OneEvent/OneEvent";
import NewGroup from "./components/NewGroup/NewGroup";
import UpdateGroup from "./components/UpdateGroup/UpdateGroup";
import DeleteGroup from "./components/DeleteGroup/DeleteGroup";
// import LoginFormPage from './components/LoginFormPage/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage/SignupFormPage';
// import LoginFormModal from './components/LoginFormModal/LoginFormModal';

//This Layout component ensures to renders App's routes only after restoreUser has returned.By loading the application after accessing the route to get the current session user GET /api/session and adding the user info to the Redux store again; This will retain the session user information across a refresh.
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "allgroups",
        element: <AllGroups />,
        children: [
          {
            path: ":groupId",
            element: <OneGroup />,
          },
        ],
      },
      {
        path: "/allevents",
        element: <AllEvents />,
        children: [
          {
            path: ":eventId",
            element: <OneEvent />,
          },
        ],
      },
      {
        path: "newgroup",
        element: <NewGroup />,
      },
      {
        path: "newevent",
        element: <h3>feature coming soon...</h3>,
      },
      {
        path: "updategroup",
        element: <UpdateGroup />,
      },
      {
        path: "deletegroup",
        element: <DeleteGroup />,
      },
      // {
      //   path:'/login',
      //   // element: <LoginFormPage />
      //   element: <LoginFormModal />
      // },
      // {
      //   path:'signup',
      //   element:<SignupFormPage/>
      // }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
