import { useEffect, useRef, useState } from "react";
import ToggleTheme from "./ToggleTheme";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import Link from "next/link";
import { LogOut } from "lucide-react";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const { userLogIn } = useUserLogIn();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    return `${
      userLogIn?.role?.name
        .split(" ")
        .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
        .join(" ") ?? "User"
    } Panel`;
  };

  const getInitials = () => {
    const words = userLogIn?.name.trim().split(" ") ?? undefined;
    if (!words) return "U";

    return words.length === 1
      ? words[0][0]?.toUpperCase() ?? ""
      : (words[0][0] + words[1][0])?.toUpperCase();
  };

  const logout = async () => {
    setOpenDropdown(false);
    const { status, data } = await HttpGateway.secureHttpPost(
      "/api/auth/logout"
    );

    if (status === 200) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("nextRefresh");
      toast.success(data.message);
      router.replace("/login");
    } else {
      toast.error(data.message);
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {getTitle()}
      </h2>

      <div className="flex items-center gap-3">
        <ToggleTheme />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold hover:bg-blue-600"
          >
            {getInitials()}
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50">
              <Link href="/profile">
                <div className="px-4 py-3 border-b dark:border-gray-700 cursor-pointer">
                  <p className="text-gray-800 dark:text-white font-semibold">
                    {userLogIn?.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {userLogIn?.role?.name ?? ""}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-5 inline mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
