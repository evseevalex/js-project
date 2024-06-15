import flatpickr from "flatpickr";
import { Income } from "./income";
import { Expenses } from "./expenses";
import { Report } from "./report";
import { FilterType } from "../types/filter.type";
import { Filter } from "../utils/filter";
import Instance = flatpickr.Instance;
import { IncomeResponseType, IncomesType } from "../types/income.type";
import { ExpenseResponseType, ExpensesType } from "../types/expense.type";
import { OperationsResponseType } from "../types/response.type";
import { OperationType } from "../types/operation.type";
import Chart, { ChartItem } from "chart.js/auto";

export class Dashboard {
  private dateFrom: Instance | Instance[];
  private dateTo: Instance | Instance[];
  private readonly income: HTMLCanvasElement | null;
  private readonly expense: HTMLCanvasElement | null;
  private incomeChart: Chart<"pie", number[], string> | null = null;
  private expenseChart: Chart<"pie", number[], string> | null = null;
  private readonly filter: FilterType;

  constructor() {
    this.dateFrom = flatpickr("#dateFrom");
    this.dateTo = flatpickr("#dateTo");

    this.income = document.getElementById("left-chart") as HTMLCanvasElement;
    this.expense = document.getElementById("right-chart") as HTMLCanvasElement;
    this.filter = {
      period: Filter.ALL,
      dateTo: "",
      dateFrom: "",
    };
    (this.dateFrom as Instance).config.onChange.push(
      async (
        selectedDates: Date[],
        dateStr: string,
        instance: Instance,
      ): Promise<void> => {
        this.filter.dateFrom = dateStr;
        await Report.getInstance()!.setFilter(this.filter);
        await Report.get();
        this.destroyCharts();
        await this.renderCharts();
      },
    );

    (this.dateTo as Instance).config.onChange.push(
      async (
        selectedDates: Date[],
        dateStr: string,
        instance: Instance,
      ): Promise<void> => {
        this.filter.dateTo = dateStr;
        await Report.getInstance()!.setFilter(this.filter);
        await Report.get();
        this.destroyCharts();
        await this.renderCharts();
      },
    );

    document
      .querySelectorAll('input[name="filter"]')
      .forEach((radio: Element): void => {
        radio.addEventListener("change", async (): Promise<void> => {
          this.filter.period = (radio as HTMLInputElement).value as Filter;
          (this.dateFrom as Instance).input.setAttribute(
            "disabled",
            "disabled",
          );
          (this.dateTo as Instance).input.setAttribute("disabled", "disabled");
          if ((radio as HTMLInputElement).value === "today") {
            this.filter.dateFrom = new Date().toISOString().slice(0, 10);
            this.filter.dateTo = new Date().toISOString().slice(0, 10);
          } else if ((radio as HTMLInputElement).value === "interval") {
            (this.dateFrom as Instance).input.removeAttribute("disabled");
            (this.dateTo as Instance).input.removeAttribute("disabled");
            this.filter.dateFrom = new Date(1907, 1, 1)
              .toISOString()
              .slice(0, 10);
            this.filter.dateTo = new Date().toISOString().slice(0, 10);
          }
          (await Report.get()).setFilter(this.filter);
          this.destroyCharts();
          await this.renderCharts();
        });
      });
  }

  async renderCharts(): Promise<void> {
    let incomeLabels: IncomesType = await Income.get().then(
      (pr: Income) => pr.incomes,
    );
    let expenseLabels: ExpensesType = await Expenses.get().then(
      (pr: Expenses) => pr.expenses,
    );

    let data: OperationsResponseType = await Report.get().then(
      (pr: Report) => pr.reports,
    );
    let incomeData: number[] = incomeLabels.map((itemL: IncomeResponseType) => {
      return data.reduce((acc: number, item: OperationType): number => {
        if (itemL.title === item.category && item.type === "income") {
          return acc + item.amount;
        }
        return acc;
      }, 0);
    });
    let expenseData: number[] = expenseLabels.map(
      (itemL: ExpenseResponseType) => {
        return data.reduce((acc: number, item: OperationType): number => {
          if (itemL.title === item.category && item.type === "expense") {
            return acc + item.amount;
          }
          return acc;
        }, 0);
      },
    );
    this.incomeChart = new Chart(<ChartItem>this.income, {
      type: "pie",
      data: {
        labels: incomeLabels.map((item: IncomeResponseType) => item.title),
        datasets: [
          {
            label: "Доходы",
            data: incomeData,
          },
        ],
      },
    });
    this.expenseChart = new Chart(<ChartItem>this.expense, {
      type: "pie",
      data: {
        labels: expenseLabels.map((item: ExpenseResponseType) => item.title),
        datasets: [
          {
            label: "Расходы",
            data: expenseData,
          },
        ],
      },
    });

    this.incomeChart.update();
    this.expenseChart.update();
  }

  destructor(): void {
    (this.dateFrom as Instance).destroy();
    (this.dateTo as Instance).destroy();
    this.destroyCharts();
  }

  destroyCharts(): void {
    this.incomeChart?.destroy();
    this.expenseChart?.destroy();
  }
}
