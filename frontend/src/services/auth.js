import config from "../config/config";

export class Auth {
  static accessTokenKey = "accessToken";
  static refreshTokenKey = "refreshToken";
  static userInfoKey = "userInfo";

  static setAuthInfo(tokens = null, userInfo = null) {
    if (tokens) {
      localStorage.setItem(this.accessTokenKey, tokens.accessToken);
      localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    }

    if (userInfo) {
      localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
    }
  }

  static removeAuthInfo() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userInfoKey);
  }

  static getAuthInfo(key = null) {
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

  static async updateRefreshToken() {
    let result = false;
    const refreshToken = Auth.getAuthInfo(Auth.refreshTokenKey);
    console.log(refreshToken);
    if (refreshToken) {
      const response = await fetch(config.api + "/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });

      if (response && response.status === 200) {
        const tokens = await response.json();
        if (tokens && !tokens.error) {
          this.setAuthInfo(tokens.accessToken, tokens.refreshToken);
          result = true;
        }
      }
    }

    if (!result) {
      this.removeAuthInfo();
    }

    return result;
  }
}
