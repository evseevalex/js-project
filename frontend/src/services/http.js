import { Auth } from "./auth";
import config from "../config/config";

export class Http {
  static async request(url, method = "GET", useAuth = true, body = null) {
    const result = {
      error: false,
      response: null,
    };
    const params = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    let token = null;
    if (useAuth) {
      token = Auth.getAuthInfo(Auth.accessTokenKey);
      if (token) params.headers["authorization"] = token;
    }

    if (body) {
      params.body = JSON.stringify(body);
    }

    let response = null;
    try {
      response = await fetch(config.api + url, params);
      result.response = await response.json();
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
          const updateTokenResult = await Auth.updateRefreshToken();
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
