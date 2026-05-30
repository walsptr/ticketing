import { motion } from "framer-motion";
import { UpdatePasswordValidation } from "../_validation";
import { useState } from "react";
import TextInput from "components/forminput/TextInput";
import { Eye, EyeClosed, SendIcon } from "lucide-react";
import PrimaryButton from "components/forminput/PrimaryButton";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type UpdatePasswordProps = {
  changeTab: () => void;
};

export default function UpdatePassword({ changeTab }: UpdatePasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const router = useRouter();

  const onSubmit = async () => {
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpPut(
      "/api/auth/password",
      JSON.stringify(values)
    );

    if (status === 200) {
      toast.success(data.message);

      if (Boolean(values.logoutAllDevices)) {
        router.replace("/login");
      } else {
        changeTab();
      }
    }

    setIsLoading(false);
  };

  const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
    UpdatePasswordValidation(onSubmit);

  return (
    <motion.div
      key="info"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <form
        className="space-y-4 mt-4"
        method="post"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="relative">
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="currentPassword"
          >
            Current Password
          </label>
          <TextInput
            type={showPassword.currentPassword ? "text" : "password"}
            name="currentPassword"
            label="Current Password"
            error={Boolean(errors.currentPassword)}
            touched={Boolean(touched.currentPassword)}
            value={values.currentPassword}
            onBlur={handleBlur}
            helperText={errors.currentPassword}
            onChange={handleChange}
          />
          <button
            onClick={() =>
              setShowPassword({
                ...showPassword,
                currentPassword: !showPassword.currentPassword,
              })
            }
            type="button"
            className="absolute right-5 top-11 text-gray-500 dark:text-gray-300"
          >
            {showPassword.currentPassword ? (
              <EyeClosed size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <div className="relative">
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="newPassword"
          >
            New Password
          </label>
          <TextInput
            type={showPassword.newPassword ? "text" : "password"}
            name="newPassword"
            label="New Password"
            error={Boolean(errors.newPassword)}
            touched={Boolean(touched.newPassword)}
            value={values.newPassword}
            onBlur={handleBlur}
            helperText={errors.newPassword}
            onChange={handleChange}
          />
          <button
            onClick={() =>
              setShowPassword({
                ...showPassword,
                newPassword: !showPassword.newPassword,
              })
            }
            type="button"
            className="absolute right-5 top-11 text-gray-500 dark:text-gray-300"
          >
            {showPassword.newPassword ? (
              <EyeClosed size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <div className="relative">
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="confirmNewPassword"
          >
            Confirm Password
          </label>
          <TextInput
            type={showPassword.confirmNewPassword ? "text" : "password"}
            name="confirmNewPassword"
            label="Confirm Password"
            error={Boolean(errors.confirmNewPassword)}
            touched={Boolean(touched.confirmNewPassword)}
            value={values.confirmNewPassword}
            onBlur={handleBlur}
            helperText={errors.confirmNewPassword}
            onChange={handleChange}
          />
          <button
            onClick={() =>
              setShowPassword({
                ...showPassword,
                confirmNewPassword: !showPassword.confirmNewPassword,
              })
            }
            type="button"
            className="absolute right-5 top-11 text-gray-500 dark:text-gray-300"
          >
            {showPassword.confirmNewPassword ? (
              <EyeClosed size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2 pb-2">
          <input
            type="checkbox"
            name="logoutAllDevices"
            id="logoutAllDevices"
            checked={Boolean(values.logoutAllDevices)}
            onChange={handleChange}
            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label className="text-sm" htmlFor="logoutAllDevices">
            Logout from all devices
          </label>
        </div>

        <PrimaryButton type="submit" isDisabled={isLoading} className="w-full">
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <SendIcon className="h-5 mr-1" />
              Submit
            </>
          )}
        </PrimaryButton>
      </form>
    </motion.div>
  );
}
