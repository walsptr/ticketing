"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Info from "./_components/info";
import Devices from "./_components/devices";
import UpdateProfile from "./_components/update-profile";
import UpdatePassword from "./_components/update-password";

export default function ProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "info" | "editProfile" | "editPassword"
  >("info");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        <div className="max-w-3xl mx-auto py-10 px-4 text-gray-800 dark:text-gray-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => router.push(`/dashboard`)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-1"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="text-3xl font-bold mb-2 text-gray-600 dark:text-gray-100">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Showing your data information and can change password
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 rounded ${
                  activeTab === "info"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab("editProfile")}
                className={`px-4 py-2 rounded ${
                  activeTab === "editProfile"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Change Profile
              </button>
              <button
                onClick={() => setActiveTab("editPassword")}
                className={`px-4 py-2 rounded ${
                  activeTab === "editPassword"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Change Password
              </button>
            </div>

            <hr className="border-gray-300 dark:border-gray-600" />

            <AnimatePresence mode="wait">
              {activeTab === "info" ? (
                <>
                  <Info />
                  <Devices />
                </>
              ) : activeTab === "editProfile" ? (
                <UpdateProfile changeTab={() => setActiveTab("info")} />
              ) : (
                <UpdatePassword changeTab={() => setActiveTab("info")} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
