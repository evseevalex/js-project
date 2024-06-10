import flatpickr from "flatpickr";
import { Income } from "./income";
import { Expenses } from "./expenses";
import { Report } from "./report";
import { log10 } from "chart.js/helpers";

export class Dashboard {
  constructor() {
    let dateFrom = flatpickr("#dateFrom");
    let dateTo = flatpickr("#dateTo");

    const income = document.getElementById("left-chart");
    const expense = document.getElementById("right-chart");

    this.incomeChart = new Chart(income, {
      type: "pie",
    });
    this.expenseChart = new Chart(expense, {
      type: "pie",
    });
    this.filter = {};
    dateFrom.config.onChange.push(async (selectedDates, dateStr, instance) => {
      this.filter.dateFrom = dateStr;
      await Report.getInstance().setFilter(this.filter);
      await Report.get();
      await this.renderCharts();
    });

    dateTo.config.onChange.push(async (selectedDates, dateStr, instance) => {
      this.filter.dateFrom = dateStr;
      await Report.getInstance().setFilter(this.filter);
      await Report.get();
      await this.renderCharts();
    });

    document.querySelectorAll('input[name="filter"]').forEach((radio) => {
      radio.addEventListener("change", async () => {
        this.filter.period = radio.value;
        dateFrom.input.setAttribute("disabled", "disabled");
        dateTo.input.setAttribute("disabled", "disabled");
        if (radio.value === "today") {
          this.filter.dateFrom = new Date().toISOString().slice(0, 10);
          this.filter.dateTo = new Date().toISOString().slice(0, 10);
        } else if (radio.value === "interval") {
          dateFrom.input.removeAttribute("disabled");
          dateTo.input.removeAttribute("disabled");
          this.filter.dateFrom = new Date(1907, 1, 1)
            .toISOString()
            .slice(0, 10);
          this.filter.dateTo = new Date().toISOString().slice(0, 10);
        }
        (await Report.get()).setFilter(this.filter);
        await this.renderCharts();
      });
    });
  }

  async renderCharts() {
    let incomeLabels = await Income.get().then((pr) => pr.incomes);
    let expenseLabels = await Expenses.get().then((pr) => pr.expenses);

    let data = await Report.get().then((pr) => pr.reports);
    let incomeData = incomeLabels.map((itemL) => {
      return data.reduce((acc, item) => {
        if (itemL.title === item.category && item.type === "income") {
          return acc + item.amount;
        }
        return acc;
      }, 0);
    });
    let expenseData = expenseLabels.map((itemL) => {
      return data.reduce((acc, item) => {
        if (itemL.title === item.category && item.type === "expense") {
          return acc + item.amount;
        }
        return acc;
      }, 0);
    });
    this.incomeChart.data = {
      labels: incomeLabels.map((item) => item.title),
      datasets: [
        {
          label: "Доходы",
          data: incomeData,
          hoverOffset: 4,
        },
      ],
    };
    this.expenseChart.data = {
      labels: expenseLabels.map((item) => item.title),
      datasets: [
        {
          label: "Расходы",
          data: expenseData,
          hoverOffset: 4,
        },
      ],
    };

    this.incomeChart.update();
    this.expenseChart.update();
    //
    // new Chart(expense, {
    //   type: "pie",
    //   data: {
    //     labels: expenseLabels.map((item) => item.title),
    //     datasets: [
    //       {
    //         label: "Доходы",
    //         data: [300, 50, 100, 500, 150],
    //         backgroundColor: [
    //           "rgba(220, 53, 69)",
    //           "rgba(253, 126, 20)",
    //           "rgba(255, 193, 7)",
    //           "rgba(32, 201, 151)",
    //           "rgba(13, 110, 253)",
    //         ],
    //         hoverOffset: 4,
    //         // radius: 180,
    //       },
    //     ],
    //   },
    // });
  }

  destructor() {
    document.querySelector("#dateFrom")._flatpickr.destroy();
    document.querySelector("#dateTo")._flatpickr.destroy();
  }
}
