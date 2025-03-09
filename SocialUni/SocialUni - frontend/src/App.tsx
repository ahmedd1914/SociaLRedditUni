import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Navigate,
} from "react-router-dom";
import AdminHome from "./pages/AdminHome";
import Users from "./pages/Users";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Menu from "./components/menu/Menu";
import Error from "./pages/Error";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import ToasterProvider from "./components/ToasterProvider";
import EditProfile from "./pages/EditProfile";
import User from "./pages/User";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Groups from "./pages/Groups";
import Comments from "./pages/Comments";
import EditData from "./components/EditData";
import Home from "./pages/Home";
import Events from "./pages/Events";

function App() {
  // Layout with Navbar + Sidebar + Footer
  const AdminLayout = () => {
    return (
      <div
        id="rootContainer"
        className="w-full p-0 m-0 overflow-visible min-h-screen flex flex-col justify-between"
      >
        <ToasterProvider />
        <ScrollRestoration />
        <div>
          <Navbar />
          <div className="w-full flex gap-0 pt-20 xl:pt-[96px] 2xl:pt-[112px] mb-auto">
            {/* Sidebar */}
            <div className="hidden xl:block xl:w-[250px] 2xl:w-[280px] 3xl:w-[350px] border-r-2 border-base-300 dark:border-slate-700 px-3 xl:px-4 xl:py-1">
              <Menu />
            </div>
            {/* Main Content */}
            <div className="w-full px-4 xl:px-4 2xl:px-5 xl:py-2 overflow-clip">
              <Outlet />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const RootLayout = () => {
    return (
      <div
        id="rootContainer"
        className="w-full p-0 m-0 overflow-visible min-h-screen flex flex-col justify-between"
      >
        <ToasterProvider />
        <ScrollRestoration />
        <div>
          <Navbar />
          <div className="w-full flex gap-0 pt-20 xl:pt-[96px] 2xl:pt-[112px] mb-auto">
            {/* Sidebar */}
            <div className="hidden xl:block xl:w-[250px] 2xl:w-[280px] 3xl:w-[350px] border-r-2 border-base-300 dark:border-slate-700 px-3 xl:px-4 xl:py-1">
              <Menu />
            </div>
            {/* Main Content */}
            <div className="w-full px-4 xl:px-4 2xl:px-5 xl:py-2 overflow-clip">
              <Outlet />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Define the routes
  const router = createBrowserRouter([
    // Root redirect
    {
      path: "/",
      element: <Navigate to="/home" replace />,
      errorElement: <Error />,
    },

    // Auth routes
    {
      path: "/login",
      element: <Login />,
      errorElement: <Error />,
    },
    {
      path: "/register",
      element: <Register />,
      errorElement: <Error />,
    },
    {
      path: "/verify",
      element: <Verify />,
      errorElement: <Error />,
    },

    // Regular user routes
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <Error />,
      children: [
        {
          path: "home",
          element: <Home />,
        },
        // Posts routes
        {
          path: "posts",
          element: <Posts />,
        },
        {
          path: "posts/:id/edit",
          element: <EditData slug="posts" />,
        },
        // Groups routes
        {
          path: "groups",
          element: <Groups />,
        },

        {
          path: "groups/:id/edit",
          element: <EditData slug="groups" />,
        },
        // Comments routes
        {
          path: "comments",
          children: [
            {
              index: true,
              element: <Comments />,
            },
            {
              path: "active",
              element: <Comments showActiveOnly={true} />,
            },
            {
              path: ":id/edit",
              element: <EditData slug="comments" />,
            },
          ],
        },
        // Profile routes
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "profile/edit",
          element: <EditProfile />,
        },
        // Events routes
        {
          path: "events",
          children: [
            {
              index: true,
              element: <Events />,
            },
            {
              path: ":id/edit",
              element: <EditData slug="events" />,
            },
          ],
        },
      ],
    },

    // Admin routes
    {
      path: "/admin",
      element: <AdminLayout />,
      errorElement: <Error />,
      children: [
        {
          path: "home",
          element: <AdminHome />,
        },
        // Users admin routes
        {
          path: "users",
          element: <Users />,
        },
        {
          path: "users/:id",
          element: <User />,
        },
        {
          path: "users/:id/edit",
          element: <EditData slug="admin/users" />,
        },
        // Posts admin routes
        {
          path: "posts",
          element: <Posts />,
        },

        {
          path: "posts/:id/edit",
          element: <EditData slug="admin/posts" />,
        },
        // Groups admin routes
        {
          path: "groups",
          element: <Groups />,
        },

        {
          path: "groups/:id/edit",
          element: <EditData slug="admin/groups" />,
        },
        // Comments admin routes
        {
          path: "comments",
          children: [
            {
              index: true,
              element: <Comments />,
            },
            {
              path: "active",
              element: <Comments showActiveOnly={true} />,
            },
            {
              path: ":id/edit",
              element: <EditData slug="admin/comments" />,
            },
          ],
        },
        // Events admin routes
        {
          path: "events",
          children: [
            {
              index: true,
              element: <Events />,
            },
            {
              path: ":id/edit",
              element: <EditData slug="admin/events" />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
