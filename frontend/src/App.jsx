import {createBrowserRouter, Outlet, RouterProvider} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { restoreUser } from './store/session';
import Navigation from './components/Navigation/Navigation';
// import LoginFormPage from './components/LoginFormPage/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage/SignupFormPage';
// import LoginFormModal from './components/LoginFormModal/LoginFormModal';

//This Layout component ensures to renders App's routes only after restoreUser has returned.By loading the application after accessing the route to get the current session user GET /api/session and adding the user info to the Redux store again; This will retain the session user information across a refresh.
function Layout(){
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(()=>{
    dispatch(restoreUser()).then(()=> {
      setIsLoaded(true)
    })
  },[dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded}/>
      {isLoaded && <Outlet/>}
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path:'/',
        element: <h1>welcome</h1>
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
    ]
  }
])


function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
