import {createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './pages/RootLayout';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Congrats from './pages/Congrats';
import Elections from './pages/Elections';
import ElectionDetails from './pages/ElectionDetails';
import Results from './pages/Results';
import Candidates from './pages/Candidates';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Teams from './pages/Teams.jsx';

//https://www.youtube.com/watch?v=lwVdmLP3Fh0
const router = createBrowserRouter([
  {
    path : '/',
    element : <RootLayout/>,
    errorElement : <ErrorPage/>,
    children : [
       {
          index : true,
          element : <Login/>
       },
       {
          path : "register",
          element : <Register/>
        },
        {
          path : "congrats",
          element : <Congrats/>
        },
        {
          path : "elections",
          element : <Elections/>
        },
        {
          path : "elections/:id",
          element : <ElectionDetails/>
        },
        {
          path : "results",
          element : <Results/>
        },
        {
          path : "elections/:id/candidates",
          element : <Candidates/>
        },
        {
          path : "Logout",
          element : <Logout/>
        },
        {
          path : "profile",
          element : <Profile/>
        },
        {
          path : "teams",
          element : <Teams/>
        }
    ]
  }
])


function App() {




  return (
    <RouterProvider router={router} />
  );
}

export default App;
