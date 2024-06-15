import config from "../config/config";
import { Auth } from "./auth";
import { Http } from "./http";
import { UserInfoType } from "../types/user-info.type";
import {
  BalanceResponseType,
  CustomResponseType,
  DefaultResponseType,
  TokensResponseType,
} from "../types/response.type";

export class User {
  static #instance: User;

  private id: string | unknown;
  name: string | unknown;
  lastName: string | unknown;
  private balance: number = 0;

  constructor() {
    if (User.#instance) {
      return User.#instance;
    }

    const userInfo: UserInfoType | null = JSON.parse(
      Auth.getAuthInfo(Auth.userInfoKey) as string,
    );

    if (userInfo) {
      this.id = userInfo.id;
      this.name = userInfo.name;
      this.lastName = userInfo.lastName;
    }

    User.#instance = this;

    return User.#instance;
  }

  static async getUser(): Promise<User> {
    if (User.#instance) {
      return User.#instance;
    }

    const user: User = new User();
    await user.update();
    return user;
  }

  static async getBalance(): Promise<number | undefined> {
    const user: User = User.#instance;
    if (user) {
      await user.update();
      return user.balance;
    }
  }

  async update(): Promise<void> {
    this.balance = await this.updateBalance();
  }

  async updateBalance(): Promise<number> {
    const response: CustomResponseType = await Http.request(
      "/balance",
      "GET",
      true,
    );

    if (response.response && response.response.status === 200) {
      const result: BalanceResponseType = await response.response.json();
      return result ? result.balance : 0;
    }
    return 0;
  }
}
