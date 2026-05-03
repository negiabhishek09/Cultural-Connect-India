import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Profile } from "./pages/Profile";
import { Explore } from "./pages/Explore";
import { Events } from "./pages/Events";
import { Marketplace } from "./pages/Marketplace";
import { Community } from "./pages/Community";
import { Checkout } from "./pages/Checkout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminPanel } from "./pages/AdminPanel";
import { States } from './pages/States';
import { StateDetail } from './pages/StateDetail';



export const router = createBrowserRouter([

  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/community",
    element: <Community />,  
  },
  {
    path: "/events",
    element: <Events />,
  },
  {
    path: "/marketplace",
    element: <Marketplace />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute adminOnly>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },





  { path: '/states', element: <States /> },

  { path: '/states/:slug', element: <StateDetail /> },
]);
