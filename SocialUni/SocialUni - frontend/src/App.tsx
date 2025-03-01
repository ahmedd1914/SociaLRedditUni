import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Navigate,
} from 'react-router-dom';
import Home from './pages/Home';
import Users from './pages/Users';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Menu from './components/menu/Menu';
import Error from './pages/Error';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import ToasterProvider from './components/ToasterProvider';
import EditProfile from './pages/EditProfile';
import User from './pages/User';
import Login from './pages/Login';
// import Register from './pages/Register';
// import Notifications from './pages/Notifications';
// import Settings from './pages/Settings';

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

  // Define the routes
  const router = createBrowserRouter([
    // 1) Redirect root "/" to "/login"
    {
      path: '/',
      element: <Navigate to="/login" replace />,
      errorElement: <Error />,
    },
    // 2) Login route
    {
      path: '/login',
      element: <Login />,
      errorElement: <Error />,
    },
    // 3) Admin routes behind an "/admin" prefix
    {
      path: '/admin',
      element: <AdminLayout />,
      errorElement: <Error />,
      children: [
        {
          path: 'home',
          element: <Home />,
        },
        {
          path: 'profile',
          element: <Profile />,
        },
        {
          path: 'profile/edit',
          element: <EditProfile />,
        },
        {
          path: 'users',
          element: <Users />,
        },
        {
          path: 'users/:id',
          element: <User />,
        },
        {
          path: 'posts',
          element: <Posts />,
        },
        // { path: 'notifications', element: <Notifications /> },
        // { path: 'settings', element: <Settings /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
