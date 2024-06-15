import config from "../config/config";
import { TokensType } from "../types/tokens.type";
import { AuthInfoType } from "../types/auth-info.type";
import {
  DefaultResponseType,
  TokensResponseType,
} from "../types/response.type";
import { UserInfoType } from "../types/user-info.type";

export class Auth {
  static accessTokenKey: string = "accessToken";
  static refreshTokenKey: string = "refreshToken";
  static userInfoKey: string = "userInfo";

  static setAuthInfo(tokens: TokensType, userInfo?: UserInfoType): void {
    if (tokens) {
      localStorage.setItem(Auth.accessTokenKey, tokens.accessToken);
      localStorage.setItem(Auth.refreshTokenKey, tokens.refreshToken);
    }

    if (userInfo) {
      localStorage.setItem(Auth.userInfoKey, JSON.stringify(userInfo));
    }
  }

  static removeAuthInfo(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userInfoKey);
  }

  static getAuthInfo(key: string): AuthInfoType {
    if (
      key &&
      [this.accessTokenKey, this.refreshTokenKey, this.userInfoKey].includes(
        key,
      )
    ) {
      return localStorage.getItem(key);
    } else {
      return {
        [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
        [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
        [this.userInfoKey]: localStorage.getItem(this.userInfoKey),
      };
    }
  }

  static async updateRefreshToken(): Promise<boolean> {
    let result: boolean = false;
    const refreshToken: AuthInfoType = Auth.getAuthInfo(Auth.refreshTokenKey);
    if (refreshToken) {
      const response: Response = await fetch(config.api + "/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });

      if (response && response.status === 200) {
        const tokens: TokensResponseType | DefaultResponseType =
          await response.json();
        if (tokens) {
          if (
            (tokens as TokensResponseType).tokens &&
            !(tokens as DefaultResponseType).error
          ) {
            this.setAuthInfo({
              accessToken: (tokens as TokensResponseType).tokens.accessToken,
              refreshToken: (tokens as TokensResponseType).tokens.refreshToken,
            });
            result = true;
          }
        }
      }
    }

    if (!result) {
      this.removeAuthInfo();
    }

    return result;
  }
}
