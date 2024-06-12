import { Http } from "../services/http";

export class Expenses {
  static #instance = null;
  constructor() {
    if (Expenses.#instance) {
      return Expenses.#instance;
    }

    Expenses.#instance = this;
    return this;
  }

  static async get() {
    if (Expenses.#instance) {
      await Expenses.#instance.init();
      return Expenses.#instance;
    }
    const expense = new Expenses();
    await expense.init();
    return expense;
  }

  static getInstance() {
    return Expenses.#instance;
  }

  async init() {
    const result = await Http.request("/categories/expense", "GET", true);

    if (!result.error && result.response) {
      this.expenses = result.response;
    }

    return Expenses.#instance;
  }

  async view() {
    const list = document.getElementById("expense-list");
    list.innerHTML = "";
    this.expenses.forEach((item) => {
      const colElement = document.createElement("div");
      colElement.className = "col";
      const cardElement = document.createElement("div");
      cardElement.className = "card h-100";
      const cardBodyElement = document.createElement("div");
      cardBodyElement.className = "card-body";
      const titleElement = document.createElement("h2");
      titleElement.className = "card-title h3";
      titleElement.innerText = item.title;
      const cardControlElement = document.createElement("div");
      cardControlElement.className =
        "d-flex gap-1 flex-column flex-lg-row card-control";
      const editLinkElement = document.createElement("a");
      editLinkElement.className = "btn btn-primary";
      editLinkElement.innerText = "Редактировать";
      editLinkElement.setAttribute("href", "/expenses/edit");
      editLinkElement.setAttribute("data-id", item.id);
      const deleteLinkElement = document.createElement("a");
      deleteLinkElement.className = "modal-delete btn btn-danger";
      deleteLinkElement.innerText = "Удалить";
      deleteLinkElement.setAttribute("role", "button");
      deleteLinkElement.setAttribute("data-id", item.id);

      cardControlElement.appendChild(editLinkElement);
      cardControlElement.appendChild(deleteLinkElement);
      cardBodyElement.appendChild(titleElement);
      cardBodyElement.appendChild(cardControlElement);
      cardElement.appendChild(cardBodyElement);
      colElement.appendChild(cardElement);
      list.appendChild(colElement);
    });

    const html =
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

    const colElement = document.createElement("div");
    colElement.className = "col";
    colElement.innerHTML = html;
    list.appendChild(colElement);
  }

  async delete(id) {
    const result = await Http.request(
      `/categories/expense/${id}`,
      "DELETE",
      true,
    );
    return !!(!result.error && result.response);
  }

  async edit(id, title) {
    const result = await Http.request(
      `/categories/expense/${id}`,
      "PUT",
      true,
      {
        title: title,
      },
    );
    return !!(!result.error && result.response);
  }

  async add(title) {
    const result = await Http.request("/categories/expense", "POST", true, {
      title: title,
    });
    return !!(!result.error && result.response);
  }

  getItem(id) {
    return this.expenses.find((item) => item.id === id);
  }
}
