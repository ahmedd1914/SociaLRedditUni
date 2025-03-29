import React, { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUserById, updateUserProfile } from "../api/ApiCollection";
import { jwtDecode } from "jwt-decode";
import { Role, UpdateUserDto, UsersDto } from "../api/interfaces";

const EditProfile = () => {
  const modalDelete = React.useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    "https://avatars.githubusercontent.com/u/74099030?v=4"
  );
  const [originalUser, setOriginalUser] = useState<UsersDto | null>(null);
  const [imageError, setImageError] = useState(false);

  const [profile, setProfile] = useState<UpdateUserDto>({
    fname: "",
    lname: "",
    phoneNumber: "",
    username: "",
    email: "",
    imgUrl: "",
    role: Role.USER,
    enabled: true,
  });

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Clear any previous image error
      setImageError(false);
      
      // Clean up old preview URL if exists
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      
      setSelectedFile(file);
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleIconClick = () => fileInputRef.current?.click();

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated!");
      navigate("/login");
      return;
    }

    const decoded: any = jwtDecode(token);
    const userId = Number(decoded.sub);

    try {
      const user: UsersDto = await fetchUserById(userId);
      setOriginalUser(user);

      setProfile({
        fname: user.fname ?? "",
        lname: user.lname ?? "",
        phoneNumber: user.phoneNumber ?? "",
        username: user.username,
        email: user.email,
        imgUrl: user.imgUrl ?? "",
        role: user.role,
        enabled: user.enabled,
      });

      setPreview(
        user.imgUrl || "https://avatars.githubusercontent.com/u/74099030?v=4"
      );
    } catch (err) {
      toast.error("Failed to fetch profile");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle image load errors
  const handleImageError = () => {
    setImageError(true);
    setPreview(originalUser?.imgUrl || "https://avatars.githubusercontent.com/u/74099030?v=4");
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke any blob URLs to prevent memory leaks
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Helper function to determine correct profile path
  const getProfilePath = () => {
    return location.pathname.includes('/admin') ? '/admin/profile' : '/profile';
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not authenticated!");
      navigate("/login");
      return;
    }

    const decoded: any = jwtDecode(token);
    const userId = Number(decoded.sub);

    try {
      const updatedProfile: UpdateUserDto = { ...profile };
      
      // Handle image updates
      if (selectedFile) {
        // For file uploads, convert to base64 and send to backend
        try {
          const base64Image = await fileToBase64(selectedFile);
          updatedProfile.imgUrl = base64Image;
        } catch (error) {
          console.error("Failed to process image:", error);
          toast.error("Failed to process image. Please try another file or use a URL.");
          return;
        }
      } else if (profile.imgUrl && profile.imgUrl !== originalUser?.imgUrl) {
        // For direct URL input, just use the URL
        updatedProfile.imgUrl = profile.imgUrl;
      }

      await updateUserProfile(userId, updatedProfile);
      toast.success("Profile updated successfully!");
      
      navigate(getProfilePath());
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    // screen
    <div className="w-full p-0 m-0">
      {/* container */}
      <div className="w-full flex flex-col items-stretch gap-7 xl:gap-8">
        {/* block 1 */}
        <div className="flex flex-col xl:flex-row items-start justify-between gap-3 xl:gap-0">
          <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
            My Profile
          </h2>
          <div className="w-full xl:w-auto grid grid-cols-2 xl:flex gap-3">
            <button
              onClick={() => navigate(`${getProfilePath()}?refresh=${new Date().getTime()}`)}
              className="btn btn-block xl:w-auto dark:btn-neutral"
            >
              Discard Changes
            </button>
            <button
              onClick={handleUpdateProfile}
              className="btn btn-block xl:w-auto btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
        {/* block 2 */}
        <div className="flex items-center gap-3 xl:gap-8 xl:mb-4">
          {/* Photo */}
          <div className="relative inline-flex">
            <button
              onClick={handleIconClick}
              className="btn btn-circle btn-sm xl:btn-md top-0 right-0 absolute z-[1]"
            >
              <HiOutlinePencil className="text-xs xl:text-lg" />
            </button>
            <div className="avatar">
              <div className="w-24 xl:w-36 2xl:w-48 rounded-full">
                <img
                  src={
                    (!imageError && preview) ||
                    "https://avatars.githubusercontent.com/u/74099030?v=4"
                  }
                  alt="Profile"
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
          {/* Heading */}
          <div className="flex flex-col items-start gap-1">
            <h3 className="font-semibold text-xl xl:text-3xl">
              {profile.fname} {profile.lname}
            </h3>
            <span className="font-normal text-base">{profile.email}</span>
          </div>
        </div>
        {/* block 3 */}
        <div className="w-full flex flex-col items-stretch gap-3 xl:gap-7">
          {/* heading */}
          <div className="flex items-center w-full gap-3 xl:gap-5">
            <h4 className="font-semibold text-lg xl:text-2xl whitespace-nowrap">
              Basic Information
            </h4>
            <div className="w-full h-[2px] bg-base-300 dark:bg-slate-700 mt-1"></div>
          </div>
          {/* grid */}
          <div className="w-full grid xl:grid-cols-3 gap-3 xl:gap-5 2xl:gap-20 xl:text-base">
            {/* column 1 */}
            <div className="w-full flex flex-col sm:grid sm:grid-cols-3 xl:flex xl:flex-col gap-3 xl:gap-5">
              {/* row 1 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">First Name*</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  value={profile.fname}
                  onChange={(e) =>
                    setProfile({ ...profile, fname: e.target.value })
                  }
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
              {/* row 2 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Last Name*</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  value={profile.lname}
                  onChange={(e) =>
                    setProfile({ ...profile, lname: e.target.value })
                  }
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
              {/* row 3 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Phone</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  value={profile.phoneNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber: e.target.value })
                  }
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
            </div>
            {/* column 2 */}
            <div className="w-full flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-col gap-3 xl:gap-5">
              {/* row 1 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Username*</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
              {/* row 2 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Email*</span>
                </div>
                <input
                  type="email"
                  placeholder="Type here"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
              {/* row 3 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Image URL</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={profile.imgUrl || ""}
                  onChange={(e) => {
                    // When manually entering a URL, clear any selected file
                    if (e.target.value && selectedFile) {
                      setSelectedFile(null);
                    }
                    
                    // Update preview if a valid URL is entered
                    if (e.target.value && e.target.value.match(/^https?:\/\/.+/)) {
                      setPreview(e.target.value);
                    }
                    
                    setProfile({ ...profile, imgUrl: e.target.value });
                  }}
                  className="input input-bordered w-full col-span-2 2xl:col-span-3"
                />
              </div>
            </div>
            {/* column 3 */}
            <div className="w-full flex flex-col sm:grid sm:grid-cols-3 xl:flex xl:flex-col gap-3 xl:gap-5">
              {/* row 1 */}
              <div className="w-full grid xl:grid-cols-3 2xl:grid-cols-4 items-center gap-1 xl:gap-0">
                <div className="w-full whitespace-nowrap">
                  <span className="whitespace-nowrap">Password</span>
                </div>
                <div className="btn btn-disabled col-span-2">
                  Change Password
                </div>
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
                onClick={() => toast("Gaboleh", { icon: "😠" })}
                className="btn btn-block btn-disabled flex-nowrap justify-start"
              >
                <img
                  className="w-6 opacity-20"
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
                onClick={() => toast("Gaboleh", { icon: "😠" })}
                className="btn btn-block btn-disabled justify-start"
              >
                <img
                  className="dark:hidden w-6 opacity-20"
                  src="/icons8-apple-black.svg"
                  alt="apple"
                />
                <img
                  className="hidden dark:block w-6 opacity-20"
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
                onClick={() => toast("Gaboleh", { icon: "😠" })}
                className="btn btn-ghost btn-disabled text-error text-xs xl:text-sm"
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
            className="btn btn-disabled text-error text-xs xl:text-sm"
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
                  onClick={() => toast("Lancang kamu ya!", { icon: "😠" })}
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

export default EditProfile;
