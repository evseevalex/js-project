import { Auth } from "../../services/auth";
import { Http } from "../../services/http";
import { User } from "../../services/user";
import {
  AuthResponseType,
  CustomResponseType,
  DefaultResponseType,
  SignUpResponseType,
} from "../../types/response.type";

export class SignUp {
  readonly redirect: Function;

  readonly fullNameElement: HTMLInputElement | null = null;
  readonly emailElement: HTMLInputElement | null = null;
  readonly passwordElement: HTMLInputElement | null = null;
  readonly passwordRepeatElement: HTMLInputElement | null = null;
  readonly commonErrorElement: HTMLElement | null = null;
  readonly processButtonElement: HTMLElement | null = null;

  constructor(redirect: Function) {
    this.redirect = redirect;

    if (Auth.getAuthInfo(Auth.accessTokenKey)) {
      return this.redirect("/");
    }

    this.fullNameElement = document.getElementById(
      "full-name",
    ) as HTMLInputElement;
    this.emailElement = document.getElementById("email") as HTMLInputElement;
    this.passwordElement = document.getElementById(
      "password",
    ) as HTMLInputElement;
    this.passwordRepeatElement = document.getElementById(
      "password-repeat",
    ) as HTMLInputElement;
    this.commonErrorElement = document.getElementById(
      "common-error",
    ) as HTMLInputElement;

    this.processButtonElement = document.getElementById("process-button");
    if (this.processButtonElement) {
      this.processButtonElement.addEventListener(
        "click",
        this.signUp.bind(this),
      );
    }
  }

  validateForm(): boolean {
    let isValid: boolean = true;
    if (
      this.fullNameElement &&
      this.emailElement &&
      this.passwordElement &&
      this.passwordRepeatElement &&
      this.commonErrorElement
    ) {
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
    }

    return isValid;
  }

  async signUp(): Promise<void> {
    if (this.commonErrorElement) this.commonErrorElement.style.display = "none";

    if (
      this.validateForm() &&
      this.fullNameElement &&
      this.emailElement &&
      this.passwordElement &&
      this.passwordRepeatElement
    ) {
      const response: CustomResponseType = await Http.request(
        "/signup",
        "POST",
        false,
        {
          name: this.fullNameElement.value.split(" ")[1],
          lastName: this.fullNameElement.value.split(" ")[0],
          email: this.emailElement.value,
          password: this.passwordElement.value,
          passwordRepeat: this.passwordRepeatElement.value,
        },
      );
      const result: DefaultResponseType | SignUpResponseType =
        await response.response?.json();

      if (
        (result as DefaultResponseType).error ||
        !result ||
        (result &&
          (!(result as SignUpResponseType).user.id ||
            !(result as SignUpResponseType).user.name ||
            !(result as SignUpResponseType).user.lastName ||
            !(result as SignUpResponseType).user.email))
      ) {
        if (this.commonErrorElement)
          this.commonErrorElement.style.display = "block";
        return;
      }

      const responseAuth: CustomResponseType = await Http.request(
        "/login",
        "POST",
        false,
        {
          email: this.emailElement.value,
          password: this.passwordElement.value,
          rememberMe: true,
        },
      );

      const resultAuth: DefaultResponseType | AuthResponseType =
        await responseAuth.response?.json();

      Auth.setAuthInfo(
        (resultAuth as AuthResponseType).tokens,
        (resultAuth as AuthResponseType).user,
      );

      await User.getUser();

      this.redirect("/");
    }
  }
}
