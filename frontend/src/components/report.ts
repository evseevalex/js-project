import { Http } from "../services/http";
import { Filter } from "../utils/filter";
import { FilterType } from "../types/filter.type";
import {
  CustomResponseType,
  DefaultResponseType,
  OperationsResponseType,
} from "../types/response.type";
import { OperationType } from "../types/operation.type";

export class Report {
  static #instance: Report | null = null;
  private filter: FilterType | undefined;
  reports: OperationsResponseType = [];
  constructor() {
    if (Report.#instance) {
      Report.#instance.init().then();
      return Report.#instance;
    }

    this.filter = {
      period: Filter.TODAY,
      dateFrom: "",
      dateTo: "",
    };

    Report.#instance = this;
    return this;
  }

  static async get(): Promise<Report> {
    if (Report.#instance) {
      await Report.#instance.init();
      return Report.#instance;
    }
    const report: Report = new Report();
    await report.init();
    return report;
  }

  static getInstance(): Report | null {
    return Report.#instance;
  }

  setFilter(filter: FilterType): void {
    this.filter = filter;
  }

  getFilter(): FilterType | undefined {
    return this.filter;
  }

  async init(): Promise<Report | null> {
    let filterArgs: string = "";

    if (this.filter && this.filter.period !== Filter.TODAY) {
      filterArgs = "?period=" + this.filter.period;
    }
    if (this.filter && this.filter.period === Filter.INTERVAL) {
      filterArgs +=
        "&dateFrom=" + this.filter.dateFrom + "&dateTo=" + this.filter.dateTo;
    }
    const response: CustomResponseType = await Http.request(
      "/operations" + filterArgs,
      "GET",
      true,
    );

    const result: DefaultResponseType | OperationsResponseType =
      await response.response?.json();
    if (
      !(result as DefaultResponseType).error &&
      (result as OperationsResponseType)
    ) {
      this.reports = result as OperationsResponseType;
    }

    return Report.#instance;
  }

  async view(): Promise<void> {
    const table: HTMLElement | null = document.getElementById("table-content");
    if (!table) return;
    if (table) table.innerHTML = "";

    this.reports
      .filter((item: OperationType) => item.category)
      .sort((a: OperationType, b: OperationType) => a.id - b.id)
      .forEach((item: OperationType): void => {
        const trElement: HTMLTableRowElement = document.createElement("tr");

        const thElement: HTMLTableCellElement = document.createElement("th");
        thElement.innerText = item.id.toString();
        thElement.setAttribute("scope", "row");

        const tdTypeElement: HTMLTableCellElement =
          document.createElement("td");
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

        const tdCategoryElement: HTMLTableCellElement =
          document.createElement("td");
        tdCategoryElement.innerText = item.category;

        const tdAmountElement: HTMLTableCellElement =
          document.createElement("td");
        tdAmountElement.innerText = item.amount + "$";

        const tdDateElement: HTMLTableCellElement =
          document.createElement("td");
        tdDateElement.innerText = item.date;

        const tdCommentElement: HTMLTableCellElement =
          document.createElement("td");
        tdCommentElement.innerText = item.comment;

        const tdControlElement: HTMLTableCellElement =
          document.createElement("td");
        tdControlElement.className = "d-flex gap-1";
        tdControlElement.setAttribute("align", "right");

        const aTrashElement: HTMLAnchorElement = document.createElement("a");
        aTrashElement.className = "modal-delete";
        aTrashElement.setAttribute("data-id", item.id.toString());
        aTrashElement.setAttribute("role", "button");
        aTrashElement.innerHTML = '<img src="/images/trash.svg" alt="Trash" />';

        const aEditElement: HTMLAnchorElement = document.createElement("a");
        aEditElement.setAttribute("data-id", item.id.toString());
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

  async add(data: any): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      "/operations",
      "POST",
      true,
      data,
    );
    const result: DefaultResponseType | OperationsResponseType =
      await response.response?.json();
    return !(result as DefaultResponseType).error && !!result;
  }

  async delete(id: number): Promise<boolean> {
    const result: CustomResponseType = await Http.request(
      `/operations/${id}`,
      "DELETE",
      true,
    );
    return !result.error;
  }

  async edit(id: number, data: any): Promise<boolean> {
    const response: CustomResponseType = await Http.request(
      `/operations/${id}`,
      "PUT",
      true,
      data,
    );
    const result: DefaultResponseType | OperationsResponseType =
      await response.response?.json();
    return !(result as DefaultResponseType).error && !!result;
  }

  getItem(id: number): OperationType | undefined {
    return this.reports.find((item: OperationType): boolean => item.id === id);
  }
}
