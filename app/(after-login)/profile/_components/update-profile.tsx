import TextInput from "components/forminput/TextInput";
import { motion } from "framer-motion";
import { UpdateProfileValidation } from "../_validation";
import PrimaryButton from "components/forminput/PrimaryButton";
import { useState } from "react";
import { SendIcon } from "lucide-react";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import { toast } from "sonner";

type UpdateProfileProps = {
  changeTab: () => void;
};

export default function UpdateProfile({ changeTab }: UpdateProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { changeUserLogIn } = useUserLogIn();

  const onSubmit = async () => {
    setIsLoading(true);
    const { status, data } = await HttpGateway.secureHttpPutForm(
      "/api/auth/me",
      values
    );

    if (status === 200) {
      sessionStorage.removeItem("user");
      toast.success(data.message);
      changeUserLogIn();
      changeTab();
    }

    setIsLoading(false);
  };

  const { values, errors, touched, setFieldValue, handleSubmit, handleBlur } =
    UpdateProfileValidation(onSubmit);

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
        <div>
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="avatarUrl"
          >
            Upload Avatar
          </label>
          <TextInput
            type="file"
            name="avatarUrl"
            label="Avatar Url"
            error={Boolean(errors.avatar)}
            touched={Boolean(touched.avatar)}
            onChange={(event) =>
              setFieldValue("avatar", event.target.files?.[0])
            }
            onBlur={handleBlur}
            helperText={errors.avatar}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-gray-700 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-gray-600"
          />
        </div>

        <div>
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <TextInput
            name="name"
            label="Name"
            error={Boolean(errors.name)}
            touched={Boolean(touched.name)}
            value={values.name}
            onBlur={handleBlur}
            helperText={errors.name}
            onChange={(event) => setFieldValue("name", event.target.value)}
          />
        </div>

        <div>
          <label
            className="block text-sm text-gray-600 dark:text-gray-300 mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <TextInput
            type="email"
            name="email"
            label="Email"
            error={Boolean(errors.email)}
            touched={Boolean(touched.email)}
            value={values.email}
            onBlur={handleBlur}
            helperText={errors.email}
            onChange={(event) => setFieldValue("email", event.target.value)}
            autoComplete="email"
          />
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
