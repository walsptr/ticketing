"use client";

import { useFormik } from "formik";
import { useUserLogIn } from "hooks/context/UserLogInContext";
import * as yup from "yup";

export function UpdateProfileValidation(handler: any) {
  const { userLogIn } = useUserLogIn();

  const { values, errors, touched, setFieldValue, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        avatar: "",
        name: userLogIn?.name ?? "",
        email: userLogIn?.email ?? "",
      },
      validationSchema: yup.object().shape({
        avatar: yup
          .mixed()
          .test("fileFormat", "Only image files are allowed", (value) => {
            if (value && value instanceof File) {
              const supportedFormats = [
                "jpg",
                "gif",
                "png",
                "jpeg",
                "svg",
                "webp",
                "heic",
              ];
              // Check if value is a File and use its name property
              const ext = value.name.split(".").pop()?.toLowerCase() ?? "";
              return supportedFormats.includes(ext);
            }
            return true;
          })
          .test("fileSize", "File size must be less than 5MB", (value) => {
            if (value && value instanceof File) {
              return value.size <= 5242880; // 5MB in bytes
            }
            return true;
          }),
        email: yup
          .string()
          .required("Email can't be empty")
          .email("Email is invalid"),
        name: yup.string().required("Name can't be empty"),
      }),
      onSubmit: handler,
    });

  return { values, errors, touched, setFieldValue, handleBlur, handleSubmit };
}

export function UpdatePasswordValidation(handler: any) {
  const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        logoutAllDevices: false,
      },
      validationSchema: yup
        .object()
        .shape({
          currentPassword: yup
            .string()
            .required("Current password can't be empty"),
          newPassword: yup
            .string()
            .min(8, "New password must be at least 8 characters")
            .required("New password can't be empty")
            .oneOf([yup.ref("confirmNewPassword"), ""], "Passwords must match"),
          confirmNewPassword: yup
            .string()
            .required("Confirm new password can't be empty")
            .oneOf([yup.ref("newPassword"), ""], "Passwords must match"),
        })
        .required("Form can't be empty"),
      onSubmit: handler,
    });

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
}
