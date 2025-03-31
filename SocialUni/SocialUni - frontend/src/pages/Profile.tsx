import React from "react";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API } from "../api/api";
import { DecodedToken, UsersDto, Role } from "../api/interfaces";

const Profile = () => {
  const modalDelete = React.useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = React.useState<UsersDto | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const defaultAvatar = "https://avatars.githubusercontent.com/u/74099030?v=4";

  React.useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first");
        navigate("/login");
        return;
      }

      try {
        // Use getCurrentUser instead of fetchUserById for better error handling
        const currentUser = await API.getCurrentUser();
        
        if (currentUser) {
          console.log("Fetched User from backend:", currentUser);
          
          // If your backend returns fname/lname/phone directly, this works.
          setUser({
            ...currentUser,
            fname: currentUser.fname || "", // Make sure it never breaks if missing
            lname: currentUser.lname || "",
            phoneNumber: currentUser.phoneNumber || "",
          });
        } else {
          // If getCurrentUser returns null, create a minimal user from token
          const decoded: DecodedToken = jwtDecode(token);
          const userId = parseInt(decoded.sub, 10);
          
          console.log("Creating minimal user from token:", decoded);
          
          // Create a minimal user object from the token data
          setUser({
            id: userId,
            username: decoded.sub || "User",
            email: decoded.email || "",
            role: decoded.role as Role || Role.USER,
            fname: "",
            lname: "",
            enabled: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            imgUrl: "",
            phoneNumber: ""
          });
          
          // Show a toast but don't redirect to login
          toast("Limited profile data available", { icon: "⚠️" });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        
        // Don't redirect to login on error, just show a message
        toast.error("Failed to load profile data");
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Handler for image load errors
  const handleImageError = () => {
    setImageError(true);
  };

  // Get profile path based on current route and user role
  const getProfileEditPath = () => {
    // Get user role from token instead of just checking URL
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const role = String(decoded?.role || "").trim();
        const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        
        // Return the appropriate path based on role
        return isAdmin ? '/admin/profile/edit' : '/profile/edit';
      } catch (error) {
        console.error('Error decoding token for profile path:', error);
      }
    }
    
    // Fallback to URL-based detection if token check fails
    return location.pathname.includes('/admin') ? '/admin/profile/edit' : '/profile/edit';
  };

  return (
    // screen
    <div className="w-full p-0 m-0">
      <div className="w-full flex flex-col items-stretch gap-10 xl:gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
            My Profile
          </h2>
          <button
            onClick={() => navigate(getProfileEditPath())}
            className="btn text-xs xl:text-sm dark:btn-neutral"
          >
            <HiOutlinePencil className="text-lg" /> Edit My Profile
          </button>
        </div>
        {/* block 2 */}
        {/* Avatar + Basic Info */}
        <div className="flex items-center gap-3 xl:gap-8 xl:mb-4">
          <div className="avatar">
            <div className="w-24 xl:w-36 2xl:w-48 rounded-full">
              <img
                src={
                  (!imageError && user?.imgUrl) || defaultAvatar
                }
                alt="User Avatar"
                onError={handleImageError}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h3 className="font-semibold text-xl xl:text-3xl">
              {user?.username || "Unknown User"}
            </h3>
            <span className="font-normal text-base">
              {user?.role || "User"}
            </span>
          </div>
        </div>
        {/* block 3 */}
        <div className="w-full flex flex-col items-stretch gap-3 xl:gap-7">
          {/* Basic Information Section */}
          <div className="w-full flex flex-col items-stretch gap-3 xl:gap-7">
            <div className="flex items-center w-full gap-3 xl:gap-5">
              <h4 className="font-semibold text-lg xl:text-2xl whitespace-nowrap">
                Basic Information
              </h4>
              <div className="w-full h-[2px] bg-base-300 dark:bg-slate-700 mt-1"></div>
            </div>

            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-5 xl:gap-5 xl:text-base">
              {/* Column 1 */}
              <div className="w-full flex flex-col gap-5 xl:gap-8">
                <div className="flex flex-col items-start gap-1">
                  <span>First Name</span>
                  <span className="font-semibold">{user?.fname || "-"}</span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span>Last Name</span>
                  <span className="font-semibold">{user?.lname || "-"}</span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span>Username</span>
                  <span className="font-semibold">{user?.username || "-"}</span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="w-full flex flex-col gap-5 xl:gap-8">
                <div className="flex flex-col items-start gap-1">
                  <span>Email</span>
                  <span className="font-semibold">{user?.email || "-"}</span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span>Phone</span>
                  <span className="font-semibold">
                    {user?.phoneNumber || "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span>Role</span>
                  <span className="font-semibold">{user?.role || "-"}</span>
                </div>
              </div>

              {/* Column 3 */}
              <div className="w-full flex flex-col gap-5 xl:gap-8">
                <div className="flex flex-col items-start gap-1">
                  <span>Created At</span>
                  <span className="font-semibold">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span>Last Login</span>
                  <span className="font-semibold">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "-"}
                  </span>
                </div>
                <button className="btn btn-disabled col-span-2">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* block 4 */}
        <div className="w-full flex flex-col items-stretch gap-6 xl:gap-7">
          {/* heading */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center w-full gap-3 xl:gap-5">
              <h4 className="font-semibold text-lg xl:text-2xl whitespace-nowrap">
                Account Integrations
              </h4>
              <div className="w-full h-[2px] bg-base-300 dark:bg-slate-700 mt-1"></div>
            </div>
            <span className="text-sm xl:text-sm text-neutral-400 dark:text-neutral-content">
              Authorize faster and easier with your external service account.
            </span>
          </div>
          {/* services block */}
          <div className="grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-3 xl:flex gap-5">
            {/* column 1 */}
            <div className="col-span-2 flex flex-col items-start gap-5 xl:w-[240px]">
              <button
                onClick={() =>
                  toast("Gaboleh", {
                    icon: "😠",
                  })
                }
                className="btn btn-block flex-nowrap justify-start dark:btn-neutral"
              >
                <img
                  className="w-6"
                  src="/icons8-microsoft.svg"
                  alt="microsoft"
                />
                <span className="text-start whitespace-nowrap text-xs xl:text-sm">
                  Connect with Microsoft
                </span>
              </button>
              <div className="px-4 gap-2 min-h-12 text-sm font-semibold flex items-center justify-start">
                <img className="w-6" src="/icons8-google.svg" alt="google" />
                <span className="text-start whitespace-nowrap text-xs xl:text-sm">
                  Connected with Google
                </span>
              </div>
              <button
                onClick={() =>
                  toast("Gaboleh", {
                    icon: "😠",
                  })
                }
                className="btn btn-block justify-start dark:btn-neutral"
              >
                <img
                  className="dark:hidden w-6"
                  src="/icons8-apple-black.svg"
                  alt="apple"
                />
                <img
                  className="hidden dark:block w-6"
                  src="/icons8-apple-white.svg"
                  alt="apple"
                />
                <span className="text-start whitespace-nowrap text-xs xl:text-sm">
                  Connect with Apple
                </span>
              </button>
            </div>
            {/* column 2 */}
            <div className="col-span-1 flex flex-col items-start gap-5">
              <button className="btn btn-ghost text-error"></button>
              <button
                onClick={() =>
                  toast("Gaboleh", {
                    icon: "😠",
                  })
                }
                className="btn btn-ghost text-error text-xs xl:text-sm"
              >
                Disconnect
              </button>
              <button className="btn btn-ghost text-error"></button>
            </div>
          </div>
        </div>
        {/* block 5 */}
        <div className="w-full flex justify-start items-center mt-10">
          <button
            className="btn dark:btn-neutral text-error dark:text-error text-xs xl:text-sm"
            onClick={() => modalDelete.current?.showModal()}
          >
            <HiOutlineTrash className="text-lg" />
            Delete My Account
          </button>
          <dialog id="modal_delete" className="modal" ref={modalDelete}>
            <div className="modal-box">
              <h3 className="font-bold text-lg dark:text-white">
                Action Confirmation!
              </h3>
              <p className="py-4">Do you want to delete your account?</p>
              <div className="modal-action mx-0 flex-col items-stretch justify-stretch gap-3">
                <button
                  onClick={() =>
                    toast("Lancang kamu ya!", {
                      icon: "😠",
                    })
                  }
                  className="btn btn-error btn-block text-base-100 dark:text-white"
                >
                  Yes, I want to delete my account
                </button>
                <form method="dialog" className="m-0 w-full">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="m-0 btn btn-block dark:btn-neutral">
                    No, I don't think so
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
};

export default Profile;
