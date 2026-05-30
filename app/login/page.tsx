"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginValidation from "./_validation";
import TextInput from "components/forminput/TextInput";
import { toast } from "sonner";
import ToggleTheme from "components/ToggleTheme";
import PrimaryButton from "components/forminput/PrimaryButton";
import { Eye, EyeClosed, LogIn } from "lucide-react";
import HttpGateway from "lib/middlewares/web/HttpGateway";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async () => {
    setIsLoading(true);

    const { status, data } = await HttpGateway.httpPost(
      "/api/auth/login",
      JSON.stringify(values)
    );

    setIsLoading(false);

    if (status === 200) {
      toast.success(data.message);
      sessionStorage.setItem("user", JSON.stringify(data.data));
      router.replace("/dashboard");
    } else if (status === 401) {
      toast.error(data.message);
    }
  };

  const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
    LoginValidation(onSubmit);

  return (
    <div className="relative min-h-screen items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex">
      <div className="md:w-3/4 xs:w-full max-w-screen-xl sm:m-10 md:m-10 bg-white dark:bg-gray-800 shadow sm:rounded-lg flex">
        <ToggleTheme className="absolute top-4 right-4" />

        {/* Form section */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 md:w-full">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">Sign in</h1>
            <form
              onSubmit={handleSubmit}
              className="w-full mt-8 space-y-4"
              method="post"
            >
              <TextInput
                type="email"
                name="email"
                label="Email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(errors.email)}
                touched={Boolean(touched.email)}
                autoComplete="email"
                helperText={errors.email}
              />

              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.password)}
                  touched={Boolean(touched.password)}
                  autoComplete="password"
                  helperText={errors.password}
                />
                <button
                  onClick={toggleShowPassword}
                  type="button"
                  className="absolute right-5 top-4 text-gray-500 dark:text-gray-300"
                >
                  {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <PrimaryButton
                type="submit"
                isDisabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <LogIn className="h-5 mr-1" />
                    Sign In
                  </>
                )}
              </PrimaryButton>
            </form>
          </div>
        </div>

        {/* Right image */}
        <div className="flex-1 bg-indigo-100 dark:bg-indigo-900 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          />
        </div>
      </div>
    </div>
  );
}
