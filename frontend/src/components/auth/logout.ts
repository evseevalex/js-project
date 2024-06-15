import { Auth } from "../../services/auth";
import { Http } from "../../services/http";
import { User } from "../../services/user";

export class Logout {
  readonly redirect: Function;
  constructor(redirect: Function) {
    this.redirect = redirect;

    if (
      !Auth.getAuthInfo(Auth.accessTokenKey) ||
      !Auth.getAuthInfo(Auth.refreshTokenKey)
    ) {
      return this.redirect("/login");
    }

    this.logout().then();
  }

  async logout(): Promise<void> {
    await Http.request("/logout", "POST", false, {
      refreshToken: Auth.getAuthInfo(Auth.refreshTokenKey),
    });

    Auth.removeAuthInfo();

    this.redirect("/login");
  }
}
