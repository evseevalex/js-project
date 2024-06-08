import { Auth } from "../../services/auth";
import { Http } from "../../services/http";
import { User } from "../../services/user";

export class Login {
  constructor(redirect) {
    this.redirect = redirect;

    if (Auth.getAuthInfo(Auth.accessTokenKey)) {
      return this.redirect("/");
    }

    this.emailElement = document.getElementById("email");
    this.passwordElement = document.getElementById("password");
    this.rememberElement = document.getElementById("rememberMe");
    this.commonErrorElement = document.getElementById("common-error");

    document
      .getElementById("process-button")
      .addEventListener("click", this.login.bind(this));
  }

  validateForm() {
    let isValid = true;
    if (
      this.emailElement.value &&
      this.emailElement.value.match(
        /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/,
      )
    ) {
      this.emailElement.classList.remove("is-invalid");
    } else {
      this.emailElement.classList.add("is-invalid");
      isValid = false;
    }

    if (this.passwordElement.value) {
      this.passwordElement.classList.remove("is-invalid");
    } else {
      this.passwordElement.classList.add("is-invalid");
      isValid = false;
    }

    return isValid;
  }

  async login() {
    this.commonErrorElement.style.display = "none";
    this.emailElement.classList.remove("is-invalid");
    this.passwordElement.classList.remove("is-invalid");

    if (this.validateForm()) {
      const result = await Http.request("/login", "POST", false, {
        email: this.emailElement.value,
        password: this.passwordElement.value,
        rememberMe: this.rememberElement.checked,
      });

      if (
        result.error ||
        !result.response ||
        (result.response &&
          (!result.response.tokens.accessToken ||
            !result.response.tokens.refreshToken ||
            !result.response.user.id ||
            !result.response.user.name))
      ) {
        this.commonErrorElement.style.display = "block";
        this.emailElement.classList.add("is-invalid");
        this.passwordElement.classList.add("is-invalid");
        return;
      }

      Auth.setAuthInfo(result.response.tokens, result.response.user);
      await User.getUser();

      this.redirect("/");
    }
  }
}
