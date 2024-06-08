import { Auth } from "../../services/auth";
import { Http } from "../../services/http";

export class Logout {
  constructor(redirect) {
    this.redirect = redirect;

    if (
      !Auth.getAuthInfo(Auth.accessTokenKey) ||
      !Auth.getAuthInfo(Auth.refreshTokenKey)
    ) {
      return this.redirect("/login");
    }

    this.logout().then();
  }

  async logout() {
    await Http.request("/logout", "POST", false, {
      refreshToken: Auth.getAuthInfo(Auth.refreshTokenKey),
    });

    Auth.removeAuthInfo();

    this.redirect("/login");
  }
}
