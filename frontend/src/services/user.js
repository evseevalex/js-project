import config from "../config/config";
import { Auth } from "./auth";
import { Http } from "./http";

export class User {
  static #instance = null;
  constructor() {
    if (User.#instance) {
      return User.#instance;
    }

    const userInfo = JSON.parse(Auth.getAuthInfo(Auth.userInfoKey));

    this.id = userInfo.id;
    this.name = userInfo.name;
    this.lastName = userInfo.lastName;
    this.balance = 0;

    User.#instance = this;

    return User.#instance;
  }

  static getUser() {
    if (User.#instance) {
      return User.#instance;
    }
    return new User().update();
  }

  static async getBalance() {
    const user = User.#instance;
    if (user) {
      await user.update();
      return user.balance;
    }
  }

  static deleteUser() {
    User.#instance = null;
  }

  async update() {
    this.balance = await this.updateBalance();
  }

  async updateBalance() {
    const result = await Http.request("/balance", "GET", true);

    if (!result.error || result.response.balance) {
      return result.response.balance;
    }
  }
}
