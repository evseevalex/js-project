import { Http } from "../services/http";
import {
  CustomResponseType,
  DefaultResponseType,
  OperationsResponseType,
} from "../types/response.type";
import { IncomeResponseType, IncomesType } from "../types/income.type";

export class Income {
  static #instance: Income | null = null;
  incomes: IncomesType = [];
  constructor() {
    if (Income.#instance) {
      return Income.#instance;
    }

    Income.#instance = this;
    return this;
  }

  static async get(): Promise<Income> {
    if (Income.#instance) {
      await Income.#instance.init();
      return Income.#instance;
    }
    const income: Income = new Income();
    await income.init();
    return income;
  }

  static getInstance(): Income | null {
    return Income.#instance;
  }

  async init(): Promise<Income | null> {
    const response: CustomResponseType = await Http.request(
      "/categories/income",
      "GET",
      true,
    );
    const result: DefaultResponseType | IncomesType =
      await response.response?.json();

    if (!(result as DefaultResponseType).error && result) {
      this.incomes = result as IncomesType;
    }

    return Income.#instance;
  }

  async view(): Promise<void> {
    const list: HTMLElement | null = document.getElementById("income-list");
    if (!list) return;
    list.innerHTML = "";
    this.incomes.forEach((item: IncomeResponseType): void => {
      const colElement: HTMLElement = document.createElement("div");
      colElement.className = "col";
      const cardElement: HTMLElement = document.createElement("div");
      cardElement.className = "card h-100";
      const cardBodyElement: HTMLElement = document.createElement("div");
      cardBodyElement.className = "card-body";
      const titleElement: HTMLElement = document.createElement("h2");
      titleElement.className = "card-title h3";
      titleElement.innerText = item.title;
      const cardControlElement: HTMLElement = document.createElement("div");
      cardControlElement.className =
        "d-flex gap-1 flex-column flex-lg-row card-control";
      const editLinkElement: HTMLElement = document.createElement("a");
      editLinkElement.className = "btn btn-primary";
      editLinkElement.innerText = "Редактировать";
      editLinkElement.setAttribute("href", "/income/edit");
      editLinkElement.setAttribute("data-id", item.id.toString());
      const deleteLinkElement = document.createElement("a");
      deleteLinkElement.className = "modal-delete btn btn-danger";
      deleteLinkElement.innerText = "Удалить";
      deleteLinkElement.setAttribute("role", "button");
      deleteLinkElement.setAttribute("data-id", item.id.toString());

      cardControlElement.appendChild(editLinkElement);
      cardControlElement.appendChild(deleteLinkElement);
      cardBodyElement.appendChild(titleElement);
      cardBodyElement.appendChild(cardControlElement);
      cardElement.appendChild(cardBodyElement);
      colElement.appendChild(cardElement);
      list.appendChild(colElement);
    });

    const html: string =
      '      <div class="card h-100">\n' +
      '        <div class="card-body">\n' +
      "          <a\n" +
      '            class="h-100 d-flex justify-content-center align-items-center p-4"\n' +
      '            href="/income/add"\n' +
      "          >\n" +
      "            <svg\n" +
      '              width="15"\n' +
      '              height="15"\n' +
      '              viewBox="0 0 15 15"\n' +
      '              fill="none"\n' +
      '              xmlns="http://www.w3.org/2000/svg"\n' +
      "            >\n" +
      "              <path\n" +
      '                d="M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z"\n' +
      '                fill="#CED4DA"\n' +
      "              />\n" +
      "            </svg>\n" +
      "          </a>\n" +
      "        </div>\n" +
      "      </div>\n";

    const colElement: HTMLElement = document.createElement("div");
    colElement.className = "col";
    colElement.innerHTML = html;
    list.appendChild(colElement);
  }

  async delete(id: number): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      `/categories/income/${id}`,
      "DELETE",
      true,
    );
    const result: DefaultResponseType = await response.response?.json();
    return !result.error;
  }

  async edit(id: number, title: string): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      `/categories/income/${id}`,
      "PUT",
      true,
      {
        title: title,
      },
    );

    const result: DefaultResponseType = await response.response?.json();
    return !result.error;
  }

  async add(title: string): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      "/categories/income",
      "POST",
      true,
      {
        title: title,
      },
    );
    const result: DefaultResponseType = await response.response?.json();
    return !result.error;
  }

  getItem(id: number): IncomeResponseType | undefined {
    return this.incomes.find(
      (item: IncomeResponseType): boolean => item.id === id,
    );
  }
}
