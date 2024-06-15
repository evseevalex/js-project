import { Auth } from "./auth";
import config from "../config/config";
import { AuthInfoType } from "../types/auth-info.type";
import { CustomResponseType } from "../types/response.type";

export class Http {
  static async request(
    url: string,
    method: string = "GET",
    useAuth: boolean = true,
    body: any = null,
  ): Promise<any> {
    const result: CustomResponseType = {
      error: false,
      response: null,
    };
    const params: any = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    let token: AuthInfoType = null;
    if (useAuth) {
      token = Auth.getAuthInfo(Auth.accessTokenKey);
      if (token) params.headers["x-auth-token"] = token;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    let response: Response | null = null;
    try {
      response = await fetch(config.api + url, params);
      result.response = response;
    } catch (error) {
      result.error = true;
      return result;
    }

    if (response.status < 200 || response.status >= 300) {
      result.error = true;
      if (useAuth && response.status === 401) {
        if (!token) {
          result.redirect = "/login";
        } else {
          const updateTokenResult: boolean = await Auth.updateRefreshToken();
          if (updateTokenResult) {
            return this.request(url, method, useAuth, body);
          } else {
            result.redirect = "/login";
          }
        }
      }
    }

    return result;
  }
}
