import { Auth } from "../../services/auth";
import { Http } from "../../services/http";

export class SignUp {
  constructor(redirect) {
    this.redirect = redirect;

    if (Auth.getAuthInfo(Auth.accessTokenKey)) {
      return this.redirect("/");
    }

    this.fullNameElement = document.getElementById("full-name");
    this.emailElement = document.getElementById("email");
    this.passwordElement = document.getElementById("password");
    this.passwordRepeatElement = document.getElementById("password-repeat");
    this.commonErrorElement = document.getElementById("common-error");

    document
      .getElementById("process-button")
      .addEventListener("click", this.signUp.bind(this));
  }

  validateForm() {
    let isValid = true;
    if (this.fullNameElement.value) {
      this.fullNameElement.classList.remove("is-invalid");
    } else {
      this.fullNameElement.classList.add("is-invalid");
      isValid = false;
    }

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

    if (
      this.passwordElement.value &&
      this.passwordElement.value.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
      )
    ) {
      this.passwordElement.classList.remove("is-invalid");
    } else {
      this.passwordElement.classList.add("is-invalid");
      isValid = false;
    }

    if (
      this.passwordRepeatElement.value &&
      this.passwordElement.value === this.passwordRepeatElement.value
    ) {
      this.passwordRepeatElement.classList.remove("is-invalid");
    } else {
      this.passwordRepeatElement.classList.add("is-invalid");
      isValid = false;
    }

    return isValid;
  }

  async signUp() {
    this.commonErrorElement.style.display = "none";

    if (this.validateForm()) {
      const result = await Http.request("/signup", "POST", false, {
        name: this.fullNameElement.value.split(" ")[1],
        lastName: this.fullNameElement.value.split(" ")[0],
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordRepeat: this.passwordRepeatElement.value,
      });

      if (
        result.error ||
        !result.response ||
        (result.response &&
          (!result.response.user.id ||
            !result.response.user.name ||
            !result.response.user.lastName ||
            !result.response.user.email))
      ) {
        this.commonErrorElement.style.display = "block";
        return;
      }

      const resultAuth = await Http.request("/login", "POST", false, {
        email: this.emailElement.value,
        password: this.passwordElement.value,
        rememberMe: true,
      });

      Auth.setAuthInfo(resultAuth.response.tokens, resultAuth.response.user);

      this.redirect("/");
    }
  }
}
