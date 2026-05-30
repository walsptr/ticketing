import { useFormik } from "formik";
import * as yup from "yup";

export default function LoginValidation(handler: any) {
  const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: yup
        .object()
        .shape({
          email: yup
            .string()
            .required("Email can't be empty")
            .email("Email is invalid"),
          password: yup.string().required("Password can't be empty"),
        })
        .required("Form can't be empty"),
      onSubmit: handler,
    });

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
}
