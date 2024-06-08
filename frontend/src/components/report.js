import { Http } from "../services/http";
import { Filter } from "../utils/filter";

export class Report {
  static #instance = null;
  constructor() {
    if (Report.#instance) {
      Report.#instance.init();
      return Report.#instance;
    }

    this.filter = {
      period: Filter.TODAY,
      dateFrom: null,
      dateTo: null,
    };

    Report.#instance = this;
    return this;
  }

  static async get() {
    if (Report.#instance) {
      await Report.#instance.init();
      return Report.#instance;
    }
    const report = new Report();
    await report.init();
    return report;
  }

  static getInstance() {
    return Report.#instance;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  getFilter() {
    return this.filter;
  }

  async init() {
    let filterArgs = "";

    if (this.filter.period !== Filter.TODAY) {
      filterArgs = "?period=" + this.filter.period;
    }
    if (this.filter.period === Filter.INTERVAL) {
      filterArgs +=
        "&dateFrom=" + this.filter.dateFrom + "&dateTo=" + this.filter.dateTo;
    }
    const result = await Http.request("/operations" + filterArgs, "GET", true);

    if (!result.error && result.response) {
      this.reports = result.response;
    }

    return Report.#instance;
  }

  async view() {
    const table = document.getElementById("table-content");
    table.innerHTML = "";

    this.reports
      .filter((item) => item.category)
      .sort((a, b) => a.id - b.id)
      .forEach((item) => {
        const trElement = document.createElement("tr");

        const thElement = document.createElement("th");
        thElement.innerText = item.id;
        thElement.setAttribute("scope", "row");

        const tdTypeElement = document.createElement("td");
        switch (item.type) {
          case "income":
            tdTypeElement.innerText = "доход";
            tdTypeElement.className = "text-success";
            break;

          case "expense":
            tdTypeElement.innerText = "расход";
            tdTypeElement.className = "text-danger";
            break;
        }

        const tdCategoryElement = document.createElement("td");
        tdCategoryElement.innerText = item.category;

        const tdAmountElement = document.createElement("td");
        tdAmountElement.innerText = item.amount + "$";

        const tdDateElement = document.createElement("td");
        tdDateElement.innerText = item.date;

        const tdCommentElement = document.createElement("td");
        tdCommentElement.innerText = item.comment;

        const tdControlElement = document.createElement("td");
        tdControlElement.className = "d-flex gap-1";
        tdControlElement.setAttribute("align", "right");

        const aTrashElement = document.createElement("a");
        aTrashElement.className = "modal-delete";
        aTrashElement.setAttribute("data-id", item.id);
        aTrashElement.setAttribute("role", "button");
        aTrashElement.innerHTML = '<img src="/images/trash.svg" alt="Trash" />';

        const aEditElement = document.createElement("a");
        aEditElement.setAttribute("data-id", item.id);
        aEditElement.href = "/income-and-expenses/edit";
        aEditElement.innerHTML = '<img src="/images/pen.svg" alt="Pen" />';

        tdControlElement.appendChild(aTrashElement);
        tdControlElement.appendChild(aEditElement);

        trElement.appendChild(thElement);
        trElement.appendChild(tdTypeElement);
        trElement.appendChild(tdCategoryElement);
        trElement.appendChild(tdAmountElement);
        trElement.appendChild(tdDateElement);
        trElement.appendChild(tdCommentElement);
        trElement.appendChild(tdControlElement);

        table.appendChild(trElement);
      });
  }

  async add(data) {
    const result = await Http.request("/operations", "POST", true, data);
    return !!(!result.error && result.response);
  }

  async delete(id) {
    const result = await Http.request(`/operations/${id}`, "DELETE", true);
    return !!(!result.error && result.response);
  }

  async edit(id, data) {
    const result = await Http.request(`/operations/${id}`, "PUT", true, data);
    return !!(!result.error && result.response);
  }

  getItem(id) {
    return this.reports.find((item) => item.id === id);
  }
}
