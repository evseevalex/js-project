import { Auth } from "../../services/auth";
import { Http } from "../../services/http";
import { User } from "../../services/user";
import { Element } from "chart.js";
import {
  AuthResponseType,
  CustomResponseType,
  DefaultResponseType,
} from "../../types/response.type";

export class Login {
  readonly redirect: Function;
  readonly emailElement: HTMLInputElement | null = null;
  readonly passwordElement: HTMLInputElement | null = null;
  readonly rememberElement: HTMLInputElement | null = null;
  readonly commonErrorElement: HTMLElement | null = null;
  readonly processButtonElement: HTMLElement | null = null;

  constructor(redirect: Function) {
    this.redirect = redirect;

    if (Auth.getAuthInfo(Auth.accessTokenKey)) {
      this.redirect("/");
      return;
    }

    this.emailElement = document.getElementById("email") as HTMLInputElement;
    this.passwordElement = document.getElementById(
      "password",
    ) as HTMLInputElement;
    this.rememberElement = document.getElementById(
      "rememberMe",
    ) as HTMLInputElement;
    this.commonErrorElement = document.getElementById("common-error");

    this.processButtonElement = document.getElementById("process-button");
    if (this.processButtonElement) {
      this.processButtonElement.addEventListener(
        "click",
        this.login.bind(this),
      );
    }
  }

  validateForm(): boolean {
    let isValid: boolean = true;
    if (this.emailElement) {
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
    }

    if (this.passwordElement) {
      if (this.passwordElement.value) {
        this.passwordElement.classList.remove("is-invalid");
      } else {
        this.passwordElement.classList.add("is-invalid");
        isValid = false;
      }
    }

    return isValid;
  }

  async login(): Promise<void> {
    if (
      this.commonErrorElement &&
      this.emailElement &&
      this.passwordElement &&
      this.rememberElement
    ) {
      this.commonErrorElement.style.display = "none";

      this.emailElement.classList.remove("is-invalid");
      this.passwordElement.classList.remove("is-invalid");

      if (this.validateForm()) {
        const response: CustomResponseType = await Http.request(
          "/login",
          "POST",
          false,
          {
            email: this.emailElement.value,
            password: this.passwordElement.value,
            rememberMe: this.rememberElement.checked,
          },
        );

        const result: DefaultResponseType | AuthResponseType =
          await response.response?.json();

        if (
          (result as DefaultResponseType).error ||
          !(result as AuthResponseType) ||
          ((result as AuthResponseType) &&
            (!(result as AuthResponseType).tokens.accessToken ||
              !(result as AuthResponseType).tokens.refreshToken ||
              !(result as AuthResponseType).user.id ||
              !(result as AuthResponseType).user.name))
        ) {
          this.commonErrorElement.style.display = "block";
          this.emailElement.classList.add("is-invalid");
          this.passwordElement.classList.add("is-invalid");
          return;
        }

        Auth.setAuthInfo(
          (result as AuthResponseType).tokens,
          (result as AuthResponseType).user,
        );
        await User.getUser();

        this.redirect("/");
      }
    }
  }
}
