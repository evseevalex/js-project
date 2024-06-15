import { Http } from "../services/http";
import {
  CustomResponseType,
  DefaultResponseType,
} from "../types/response.type";
import { ExpenseResponseType, ExpensesType } from "../types/expense.type";
import { IncomeResponseType } from "../types/income.type";

export class Expenses {
  static #instance: Expenses | null = null;
  expenses: ExpensesType = [];
  constructor() {
    if (Expenses.#instance) {
      return Expenses.#instance;
    }

    Expenses.#instance = this;
    return this;
  }

  static async get(): Promise<Expenses> {
    if (Expenses.#instance) {
      await Expenses.#instance.init();
      return Expenses.#instance;
    }
    const expense: Expenses = new Expenses();
    await expense.init();
    return expense;
  }

  static getInstance(): Expenses | null {
    return Expenses.#instance;
  }

  async init(): Promise<Expenses | null> {
    const response: CustomResponseType = await Http.request(
      "/categories/expense",
      "GET",
      true,
    );

    const result: DefaultResponseType | ExpensesType =
      await response.response?.json();
    if (!(result as DefaultResponseType).error && (result as ExpensesType)) {
      this.expenses = result as ExpensesType;
    }

    return Expenses.#instance;
  }

  async view(): Promise<void> {
    const list: HTMLElement | null = document.getElementById("expense-list");
    if (!list) return;
    list.innerHTML = "";
    this.expenses.forEach((item: ExpenseResponseType): void => {
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
      editLinkElement.setAttribute("href", "/expenses/edit");
      editLinkElement.setAttribute("data-id", item.id.toString());
      const deleteLinkElement: HTMLElement = document.createElement("a");
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
      '            href="/expenses/add"\n' +
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
      `/categories/expense/${id}`,
      "DELETE",
      true,
    );
    const result: DefaultResponseType = await response.response?.json();
    return !result.error;
  }

  async edit(id: number, title: string): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      `/categories/expense/${id}`,
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
      "/categories/expense",
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
    return this.expenses.find(
      (item: ExpenseResponseType): boolean => item.id === id,
    );
  }
}
