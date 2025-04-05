import { lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminMenu from "./components/menu/AdminMenu";
import LeftSidebar from "./components/home/sidebar/LeftSidebar";
import Error from "./pages/Error";
import ToasterProvider from "./components/ToasterProvider";
import { useAuth } from "./contexts/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

// Lazy loaded components for better performance
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const Users = lazy(() => import("./pages/admin/AdminUsers"));
const Profile = lazy(() => import("./pages/Profile"));
const Posts = lazy(() => import("./pages/admin/AdminPosts"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const User = lazy(() => import("./pages/admin/AdminUser"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Verify = lazy(() => import("./pages/Verify"));
const Groups = lazy(() => import("./pages/admin/AdminGroups"));
const Comments = lazy(() => import("./pages/admin/AdminComments"));
const EditData = lazy(() => import("./components/EditData"));
const Home = lazy(() => import("./pages/Home"));
const Events = lazy(() => import("./pages/admin/AdminEvents"));
const Notifications = lazy(() => import("./pages/admin/AdminNotifications"));
const GroupRequests = lazy(() => import("./pages/admin/AdminGroupRequests"));
const GroupPage = lazy(() => import("./pages/GroupPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
// New admin components
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminReactions = lazy(() => import("./pages/admin/AdminReactions"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Loading component for Suspense fallback
const Loading = () => (
  <div className="w-full h-full flex items-center justify-center min-h-[200px]">
    <div className="loading loading-spinner loading-lg"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Force string comparison and check both possible formats
  const role = String(user.role).trim();
  if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

// Make toast globally available
if (typeof window !== 'undefined') {
  window.toast = toast;
}

function App() {
  // Layout with Navbar + Admin Sidebar + Footer
  const AdminLayout = () => {
    return (
      <div
        id="rootContainer"
        className="w-full p-0 m-0 overflow-visible min-h-screen flex flex-col justify-between"
      >
        <ToasterProvider />
        <div>
          <Navbar />
          <div className="w-full flex gap-0 pt-20 xl:pt-[96px] 2xl:pt-[112px] mb-auto">
            {/* Admin Sidebar */}
            <div className="hidden xl:block xl:w-[250px] 2xl:w-[280px] 3xl:w-[350px] border-r-2 border-base-300 dark:border-slate-700 px-3 xl:px-4 xl:py-1">
              <AdminMenu />
            </div>
            {/* Main Content */}
            <div className="w-full px-4 xl:px-4 2xl:px-5 xl:py-2 overflow-clip">
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Layout with Navbar + User Sidebar + Footer for regular users
  const RootLayout = () => {
    return (
      <div
        id="rootContainer"
        className="w-full p-0 m-0 overflow-visible min-h-screen flex flex-col justify-between"
      >
        <ToasterProvider />
        <div>
          <Navbar />
          <div className="w-full flex gap-0 pt-20 xl:pt-[96px] 2xl:pt-[112px] mb-auto">
            {/* User Sidebar - Reddit Style */}
            <div className="hidden xl:block xl:w-[250px] 2xl:w-[280px] 3xl:w-[350px] border-r-2 border-base-300 dark:border-slate-700 px-3 xl:px-4 xl:py-1">
              <LeftSidebar />
            </div>
            {/* Main Content */}
            <div className="w-full px-4 xl:px-6 2xl:px-8 xl:py-2 overflow-clip">
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  // Simple layout without sidebars for components that need to be accessible to all users
  const SimpleLayout = () => {
    return (
      <div
        id="rootContainer"
        className="w-full p-0 m-0 overflow-visible min-h-screen flex flex-col justify-between"
      >
        <ToasterProvider />
        <div>
          <Navbar />
          <div className="w-full pt-20 xl:pt-[96px] 2xl:pt-[112px] mb-auto">
            {/* Main Content */}
            <div className="w-full px-4 xl:px-6 2xl:px-8 xl:py-2">
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  return (
    <>
      {/* Add the Toaster component for notifications */}
      <Toaster position="top-center" />
      
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<Loading />}>
            <Register />
          </Suspense>
        } />
        <Route path="/verify" element={
          <Suspense fallback={<Loading />}>
            <Verify />
          </Suspense>
        } />
        
        {/* Public Home route - accessible to everyone */}
        <Route path="/home" element={
          <Suspense fallback={<Loading />}>
            <RootLayout />
          </Suspense>
        }>
          <Route index element={<Home />} />
        </Route>
        
        {/* Profile routes - accessible to all authenticated users in a simple layout */}
        <Route element={
          <ProtectedRoute>
            <SimpleLayout />
          </ProtectedRoute>
        }>
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
        </Route>
        
        {/* Regular user routes - accessible to any authenticated user */}
        <Route element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }>
          <Route path="posts" element={<Posts />} />
          <Route path="posts/:id/edit" element={<EditData slug="posts" />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:id/edit" element={<EditData slug="groups" />} />
          <Route path="groups/:groupId" element={<GroupPage />} />
          <Route path="group-requests" element={<GroupRequests />} />
          <Route path="comments">
            <Route index element={<Comments />} />
            <Route path="active" element={<Comments showActiveOnly={true} />} />
            <Route path=":id/edit" element={<EditData slug="comments" />} />
          </Route>
          <Route path="notifications" element={<Notifications />} />
          <Route path="events">
            <Route index element={<Events />} />
            <Route path=":id/edit" element={<EditData slug="events" />} />
          </Route>
        </Route>
        
        {/* Public routes - accessible to everyone */}
        <Route element={<SimpleLayout />}>
          <Route path="posts/:id" element={<PostPage />} />
        </Route>
        
        {/* Admin routes - restricted to admins only */}
        <Route element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="admin/home" element={<AdminHome />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/users/:id" element={<User />} />
          <Route path="admin/users/:id/edit" element={<EditData slug="admin/users" />} />
          <Route path="admin/posts" element={<Posts />} />
          <Route path="admin/posts/:id/edit" element={<EditData slug="admin/posts" />} />
          <Route path="admin/groups" element={<Groups />} />
          <Route path="admin/groups/:id/edit" element={<EditData slug="admin/groups" />} />
          <Route path="admin/group-requests" element={<GroupRequests />} />
          <Route path="admin/notifications" element={<Notifications />} />
          <Route path="admin/comments">
            <Route index element={<Comments />} />
            <Route path="active" element={<Comments showActiveOnly={true} />} />
            <Route path=":id/edit" element={<EditData slug="admin/comments" />} />
          </Route>
          <Route path="admin/events">
            <Route index element={<Events />} />
            <Route path=":id/edit" element={<EditData slug="admin/events" />} />
          </Route>
          {/* Admin profile now uses the common simple layout */}
          <Route path="admin/profile" element={<Navigate to="/profile" replace />} />
          <Route path="admin/profile/edit" element={<Navigate to="/profile/edit" replace />} />
          {/* New Admin Routes */}
          <Route path="admin/messages" element={<AdminMessages />} />
          <Route path="admin/reactions" element={<AdminReactions />} />
          <Route path="admin/settings" element={<AdminSettings />} />
        </Route>
        
        {/* Error route */}
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
