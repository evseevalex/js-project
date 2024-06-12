import { Auth } from "../../services/auth";
import { Http } from "../../services/http";
import { User } from "../../services/user";

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

    User.deleteUser();
    Auth.removeAuthInfo();

    this.redirect("/login");
  }
}
