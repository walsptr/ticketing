"use client";

import { toast } from "sonner";
import { getCookie } from "cookies-next";

type ResponseData = {
  status: string;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

export interface ApiResponse {
  status: number;
  data: ResponseData;
}

export default class HttpGateway {
  static requestFormData = async (
    method: string,
    url: string,
    body: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse> => {
    let responseJson: ResponseData = {
      status: "",
      message: "",
    };

    const formData = new FormData();

    for (const [key, value] of Object.entries(body)) {
      // console.log(`key: ${key}, value: ${value}`);
      if (value instanceof File) {
        // jika File, ikutkan nama file
        formData.append(key, value instanceof File ? value : value);
      } else if (typeof value === "object") {
        // objek biasa -> JSON string
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }

    const response = await fetch(url, {
      method,
      body: formData,
      headers: {
        ...headers,
      },
    });

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      responseJson = await response.json();
    }

    // show toast message
    if (
      response.status === 400 ||
      response.status === 403 ||
      response.status === 404 ||
      response.status === 409 ||
      response.status === 500
    ) {
      toast.error(responseJson.message, {
        description: Object.entries(responseJson.errors ?? {})
          .map((error) => error[1])
          .concat()
          .toString(),
      });
    }

    return { status: response.status, data: responseJson };
  };

  static requestJson = async (
    method: string,
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse> => {
    let responseJson: ResponseData = {
      status: "",
      message: "",
    };

    const response = await fetch(url, {
      method,
      body,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      responseJson = await response.json();
    }

    // show toast message
    if (
      response.status === 400 ||
      response.status === 403 ||
      response.status === 404 ||
      response.status === 409 ||
      response.status === 500
    ) {
      toast.error(responseJson.message, {
        description: Object.entries(responseJson.errors ?? {})
          .map((error) => error[1])
          .concat()
          .toString(),
      });
    }

    return { status: response.status, data: responseJson };
  };

  static httpRefreshToken = async () => {
    const dateToRefresh: string | null = sessionStorage.getItem("nextRefresh");

    if (dateToRefresh && new Date(dateToRefresh) > new Date()) {
      // wait until first request get the response from server
      return new Promise((resolve) => {
        let timeout: any = null;
        const timer = setInterval(() => {
          if (getCookie("accessToken")) {
            clearInterval(timer);
            clearTimeout(timeout);
            return resolve(true);
          }
        }, 1000);

        timeout = setTimeout(() => {
          clearInterval(timer);
          return resolve(true);
        }, 10000);
      });
    }

    sessionStorage.setItem(
      "nextRefresh",
      new Date(new Date().getTime() + 60 * 15 * 1000).toString()
    );

    const { status } = await HttpGateway.requestJson(
      "POST",
      "/api/auth/refresh",
      "{}"
    );

    if (status === 401) {
      toast.error("Unauthenticated, please sign in again");
      sessionStorage.removeItem("nextRefresh");
      sessionStorage.removeItem("user");
      return window.location.replace("/login");
    }
  };

  static httpGet = async (url: string) => {
    const { status, data } = await HttpGateway.requestJson("GET", url);
    return { status, data };
  };

  static httpPost = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("POST", url, body);
    return { status, data };
  };

  static httpPut = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("PUT", url, body);
    return { status, data };
  };

  static httpPatch = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("PATCH", url, body);
    return { status, data };
  };

  static httpDelete = async (url: string) => {
    const { status, data } = await HttpGateway.requestJson("DELETE", url);
    return { status, data };
  };

  static secureHttpGet = async (url: string) => {
    const { status, data } = await HttpGateway.requestJson("GET", url);

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestJson("GET", url);
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpPost = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("POST", url, body);

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestJson("POST", url, body);
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpPut = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("PUT", url, body);

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestJson("PUT", url, body);
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpPatch = async (url: string, body: any = "{}") => {
    const { status, data } = await HttpGateway.requestJson("PATCH", url, body);

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestJson(
        "PATCH",
        url,
        body
      );
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpDelete = async (url: string) => {
    const { status, data } = await HttpGateway.requestJson("DELETE", url);

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestJson("DELETE", url);
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpPostForm = async (url: string, body: any) => {
    const { status, data } = await HttpGateway.requestFormData(
      "POST",
      url,
      body
    );

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestFormData(
        "POST",
        url,
        body
      );
      return { status, data };
    }

    return { status, data };
  };

  static secureHttpPutForm = async (url: string, body: any) => {
    const { status, data } = await HttpGateway.requestFormData(
      "PUT",
      url,
      body
    );

    if (status === 401) {
      await HttpGateway.httpRefreshToken();
      const { status, data } = await HttpGateway.requestFormData(
        "POST",
        url,
        body
      );
      return { status, data };
    }

    return { status, data };
  };
}
