import { Dashboard } from "./components/dashboard";
import { Login } from "./components/auth/login";
import { Logout } from "./components/auth/logout";
import { SignUp } from "./components/auth/signup";
import { Auth } from "./services/auth";
import { User } from "./services/user";
import { Expenses } from "./components/expenses";
import { Modal, Dropdown } from "bootstrap";
import { Income } from "./components/income";
import { Report } from "./components/report";
import flatpickr from "flatpickr";
import { Route, Routes } from "./types/route.type";
import { IncomeResponseType, IncomesType } from "./types/income.type";
import { ExpenseResponseType, ExpensesType } from "./types/expense.type";
import { OperationType } from "./types/operation.type";
import Instance = flatpickr.Instance;
import { Filter } from "./utils/filter";
import { FilterType } from "./types/filter.type";

export class Router {
  private titlePageElement: HTMLElement | null;
  private readonly contentPageElement: HTMLElement | null;
  private routes: Routes;

  private dashboard: Dashboard | null = null;
  constructor() {
    this.titlePageElement = document.getElementById("page-title");
    this.contentPageElement = document.getElementById("app");
    this.eventInit();

    this.routes = [
      {
        route: "/",
        title: "Дашборд",
        filePathTemplate: "/templates/pages/dashboard.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (): Promise<void> => {
          this.activeLink("home-link");
          this.dashboard = new Dashboard();

          await this.dashboard.renderCharts();
          for (const radio of document.querySelectorAll(
            'input[name="filter"]',
          )) {
            if (
              (await Report.getInstance()?.getFilter()?.period) ===
              (radio as HTMLInputElement).value
            ) {
              (radio as HTMLInputElement).checked = true;
            }
          }
        },
        unload: (): void => {
          this.deactivateLink("home-link");
          this.dashboard?.destructor();
        },
      },
      {
        route: "/expenses",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/index.html",
        useLayout: "/templates/layout.html",
        useModals: "/templates/pages/expenses/modal.html",
        auth: true,
        load: async (): Promise<void> => {
          this.loadCollapse("expenses-link");
          await Expenses.get().then((pr: Expenses) => pr.view());
          const modalElement: Element | null =
            document.getElementById("exampleModalToggle");
          const deleteElement: HTMLElement | null =
            document.getElementById("expense-delete");
          const cancelElement: HTMLElement | null =
            document.getElementById("expense-cancel");

          let eventDelete: () => Promise<void>;
          if (modalElement) {
            let modal: Modal = new Modal(modalElement);
            Array.from(document.getElementsByClassName("modal-delete")).forEach(
              (el: Element): void => {
                el.addEventListener("click", (e: Event): void => {
                  modal.show(<HTMLElement>e.target);
                });
              },
            );

            modalElement.addEventListener(
              "hidePrevented.bs.modal",
              (e: Modal.Event): void => {
                e.preventDefault();
                modal.hide();
              },
            );

            modalElement.addEventListener(
              "show.bs.modal",
              (bootstrapEvent: Modal.Event): void => {
                eventDelete = async (): Promise<void> => {
                  let id: string | null | undefined =
                    bootstrapEvent.relatedTarget?.getAttribute("data-id");
                  if (id)
                    await Expenses.get().then((pr: Expenses) => pr.delete(+id));
                  await Expenses.get().then((pr: Expenses) => pr.view());
                  Array.from(
                    document.getElementsByClassName("modal-delete"),
                  ).forEach((el: Element): void => {
                    el.addEventListener("click", (e: Event): void => {
                      modal.show(<HTMLElement>e.target);
                    });
                  });
                  modal.hide();
                };
                if (deleteElement && eventDelete)
                  deleteElement.addEventListener("click", eventDelete);
              },
            );

            modalElement.addEventListener(
              "hidden.bs.modal",
              (e: Modal.Event): void => {
                if (deleteElement && eventDelete)
                  deleteElement.removeEventListener("click", eventDelete);
              },
            );

            if (cancelElement)
              cancelElement.addEventListener("click", (e: MouseEvent): void => {
                e.preventDefault();
                modal.hide();
              });
          }
        },
        unload: (): void => {
          this.unloadCollapse("expenses-link");
        },
      },
      {
        route: "/expenses/add",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (): Promise<void> => {
          this.loadCollapse("expenses-link");
          const createBtn: HTMLElement | null =
            document.getElementById("expense-create");
          if (createBtn) {
            createBtn.addEventListener(
              "click",
              async (e: MouseEvent): Promise<void> => {
                e.preventDefault();
                const title: HTMLElement | null =
                  document.getElementById("title-input");
                await Expenses.get().then((pr: Expenses) =>
                  pr.add((title as HTMLInputElement)?.value),
                );
                await this.redirect("/expenses");
              },
            );
          }
        },
        unload: (): void => {
          this.unloadCollapse("expenses-link");
        },
      },
      {
        route: "/expenses/edit",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args): Promise<void> => {
          this.loadCollapse("expenses-link");
          const { id } = args;
          const title: HTMLElement | null = document.getElementById("title");
          if (title) {
            (title as HTMLInputElement).value = Expenses.getInstance()?.getItem(
              +id,
            )?.title as string;
          }
          const saveBtn: HTMLElement | null =
            document.getElementById("expense-save");
          if (saveBtn)
            saveBtn.addEventListener(
              "click",
              async (e: MouseEvent): Promise<void> => {
                e.preventDefault();

                await Expenses.get().then((pr: Expenses) =>
                  pr.edit(+id, (title as HTMLInputElement).value),
                );
                await this.redirect("/expenses");
              },
            );
        },
        unload: (): void => {
          this.unloadCollapse("expenses-link");
        },
      },
      {
        route: "/income",
        title: "Доходы",
        filePathTemplate: "/templates/pages/income/index.html",
        useLayout: "/templates/layout.html",
        useModals: "/templates/pages/income/modal.html",
        auth: true,
        load: async (): Promise<void> => {
          this.loadCollapse("income-link");
          await Income.get().then((pr: Income) => pr.view());

          const modalElement: Element | null =
            document.getElementById("exampleModalToggle");
          const deleteElement: HTMLElement | null =
            document.getElementById("income-delete");
          const cancelElement: HTMLElement | null =
            document.getElementById("income-cancel");

          let eventDelete: () => Promise<void>;
          if (modalElement) {
            let modal: Modal = new Modal(modalElement);
            Array.from(document.getElementsByClassName("modal-delete")).forEach(
              (el: Element): void => {
                el.addEventListener("click", (e: Event): void => {
                  modal.show(<HTMLElement>e.target);
                });
              },
            );

            modalElement.addEventListener("hidePrevented.bs.modal", (e) => {
              e.preventDefault();
              modal.hide();
            });

            modalElement.addEventListener(
              "show.bs.modal",
              (bootstrapEvent: Modal.Event): void => {
                eventDelete = async (): Promise<void> => {
                  let id: string | null | undefined =
                    bootstrapEvent.relatedTarget?.getAttribute("data-id");
                  if (id)
                    await Income.get().then((pr: Income) => pr.delete(+id));
                  await Income.get().then((pr: Income) => pr.view());
                  Array.from(
                    document.getElementsByClassName("modal-delete"),
                  ).forEach((el: Element): void => {
                    el.addEventListener("click", (e: Event): void => {
                      modal.show(<HTMLElement>e.target);
                    });
                  });
                  modal.hide();
                };
                if (deleteElement)
                  deleteElement.addEventListener("click", eventDelete);
              },
            );

            if (cancelElement)
              cancelElement.addEventListener("click", (e: MouseEvent): void => {
                e.preventDefault();
                modal.hide();
              });

            modalElement.addEventListener(
              "hidden.bs.modal",
              (e: Modal.Event): void => {
                if (deleteElement)
                  deleteElement.removeEventListener("click", eventDelete);
              },
            );
          }
        },
        unload: (): void => {
          this.unloadCollapse("income-link");
        },
      },
      {
        route: "/income/edit",
        title: "Редактировать доходы",
        filePathTemplate: "/templates/pages/income/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args): Promise<void> => {
          this.loadCollapse("income-link");
          const { id } = args;
          const title: HTMLElement | null = document.getElementById("title");
          if (title)
            (title as HTMLInputElement).value = Income.getInstance()?.getItem(
              +id,
            )?.title as string;
          const saveBtn: HTMLElement | null =
            document.getElementById("income-save");
          if (saveBtn) {
            saveBtn.addEventListener(
              "click",
              async (e: MouseEvent): Promise<void> => {
                e.preventDefault();
                await Income.get().then((pr: Income) =>
                  pr.edit(+id, (title as HTMLInputElement).value),
                );
                await this.redirect("/income");
              },
            );
          }
        },
        unload: (): void => {
          this.unloadCollapse("income-link");
        },
      },
      {
        route: "/income/add",
        title: "Добавить доходы",
        filePathTemplate: "/templates/pages/income/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (): Promise<void> => {
          this.loadCollapse("income-link");
          const createBtn: HTMLElement | null =
            document.getElementById("income-create");
          if (createBtn) {
            createBtn.addEventListener(
              "click",
              async (e: MouseEvent): Promise<void> => {
                e.preventDefault();
                const title: HTMLElement | null =
                  document.getElementById("title-input");
                await Income.get().then((pr: Income) =>
                  pr.add((title as HTMLInputElement)?.value),
                );
                await this.redirect("/income");
              },
            );
          }
        },
        unload: (): void => {
          this.unloadCollapse("income-link");
        },
      },
      {
        route: "/income-and-expenses",
        title: "Доходы и расходы",
        filePathTemplate: "/templates/pages/income-and-expenses/index.html",
        useLayout: "/templates/layout.html",
        useModals: "/templates/pages/income-and-expenses/modal.html",
        auth: true,
        load: async (): Promise<void> => {
          this.activeLink("income-and-expenses-link");
          let dateFrom: Instance | Instance[] = flatpickr("#dateFrom");
          let dateTo: Instance | Instance[] = flatpickr("#dateTo");

          const modalElement: Element | null =
            document.getElementById("exampleModalToggle");
          const deleteElement: HTMLElement | null =
            document.getElementById("operation-delete");
          const cancelElement: HTMLElement | null =
            document.getElementById("operation-cancel");

          let eventDelete: () => Promise<void>;
          if (modalElement) {
            let modal: Modal = new Modal(modalElement);

            let filter: FilterType = {
              period: Filter.TODAY,
              dateFrom: "",
              dateTo: "",
            };
            (dateFrom as Instance).config.onChange.push(
              async (
                selectedDates: Date[],
                dateStr: string,
                instance: Instance,
              ): Promise<void> => {
                filter.dateFrom = dateStr;
                await Report.get().then(async (pr: Report): Promise<void> => {
                  pr.setFilter(filter);
                  await pr.init();
                  await pr.view();
                });
                Array.from(
                  document.getElementsByClassName("modal-delete"),
                ).forEach((el: Element): void => {
                  el.addEventListener("click", (e: Event): void => {
                    modal.show(<HTMLElement>e.currentTarget);
                  });
                });
              },
            );

            (dateTo as Instance).config.onChange.push(
              async (
                selectedDates: Date[],
                dateStr: string,
                instance: Instance,
              ): Promise<void> => {
                filter.dateTo = dateStr;
                await Report.get().then(async (pr: Report): Promise<void> => {
                  pr.setFilter(filter);
                  await pr.init();
                  await pr.view();
                });
                Array.from(
                  document.getElementsByClassName("modal-delete"),
                ).forEach((el: Element): void => {
                  el.addEventListener("click", (e: Event): void => {
                    modal.show(<HTMLElement>e.currentTarget);
                  });
                });
              },
            );

            for (const radio of document.querySelectorAll(
              'input[name="filter"]',
            )) {
              if (
                (radio as HTMLInputElement).value ===
                (await Report.get().then(
                  (rp: Report) => rp.getFilter()?.period,
                ))
              ) {
                (radio as HTMLInputElement).checked = true;
              }
              radio.addEventListener("change", async () => {
                filter.period = (radio as HTMLInputElement).value;
                (dateFrom as Instance).input.setAttribute(
                  "disabled",
                  "disabled",
                );
                (dateTo as Instance).input.setAttribute("disabled", "disabled");
                if ((radio as HTMLInputElement).value === "today") {
                  filter.dateFrom = new Date().toISOString().slice(0, 10);
                  filter.dateTo = new Date().toISOString().slice(0, 10);
                } else if ((radio as HTMLInputElement).value === "interval") {
                  (dateFrom as Instance).input.removeAttribute("disabled");
                  (dateTo as Instance).input.removeAttribute("disabled");
                  filter.dateFrom = new Date(1907, 1, 1)
                    .toISOString()
                    .slice(0, 10);
                  filter.dateTo = new Date().toISOString().slice(0, 10);
                }

                Report.getInstance()?.setFilter(filter);

                await Report.get().then(async (pr: Report): Promise<void> => {
                  await pr.view();
                });

                Array.from(
                  document.getElementsByClassName("modal-delete"),
                ).forEach((el: Element): void => {
                  el.addEventListener("click", (e: Event): void => {
                    modal.show(<HTMLElement>e.currentTarget);
                  });
                });
              });
            }

            await Report.get().then(async (pr: Report): Promise<void> => {
              await pr.init();
              await pr.view();
            });

            Array.from(document.getElementsByClassName("modal-delete")).forEach(
              (el: Element): void => {
                el.addEventListener("click", (e: Event): void => {
                  modal.show(<HTMLElement>e.currentTarget);
                });
              },
            );

            modalElement.addEventListener(
              "hidePrevented.bs.modal",
              (e: Modal.Event): void => {
                e.preventDefault();
                modal.hide();
              },
            );

            modalElement.addEventListener(
              "show.bs.modal",
              (bootstrapEvent: Modal.Event): void => {
                eventDelete = async (): Promise<void> => {
                  let id: string | null | undefined =
                    bootstrapEvent.relatedTarget?.getAttribute("data-id");
                  if (id) await Report.get().then((pr) => pr.delete(+id));
                  await Report.get().then((pr) => pr.view());
                  await this.updateBalance();
                  Array.from(
                    document.getElementsByClassName("modal-delete"),
                  ).forEach((el: Element): void => {
                    el.addEventListener("click", (e: Event): void => {
                      modal.show(<HTMLElement>e.currentTarget);
                    });
                  });
                  modal.hide();
                };
                if (deleteElement)
                  deleteElement.addEventListener("click", eventDelete);
              },
            );

            if (cancelElement)
              cancelElement.addEventListener("click", (e: MouseEvent): void => {
                e.preventDefault();
                modal.hide();
              });

            modalElement.addEventListener(
              "hidden.bs.modal",
              (e: Modal.Event): void => {
                if (deleteElement)
                  deleteElement.removeEventListener("click", eventDelete);
              },
            );
          }
        },
        unload: (): void => {
          this.deactivateLink("income-and-expenses-link");
          const dateFromElement: HTMLElement | null =
            document.querySelector("#dateFrom");
          const dateToElement: HTMLElement | null =
            document.querySelector("#dateTo");
          if (dateFromElement) {
            (dateFromElement as any)._flatpickr.destroy();
          }
          if (dateToElement) {
            (dateToElement as any)._flatpickr.destroy();
          }
        },
      },
      {
        route: "/income-and-expenses/edit",
        title: "Редактировать",
        filePathTemplate: "/templates/pages/income-and-expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args: any): Promise<void> => {
          this.activeLink("income-and-expenses-link");

          const { id } = args;
          let type: HTMLElement | null = document.getElementById("type");
          let category: HTMLElement | null =
            document.getElementById("category");
          let amount: HTMLElement | null = document.getElementById("amount");
          let date: HTMLElement | null = document.getElementById("date");
          let comment: HTMLElement | null = document.getElementById("comment");

          let data: OperationType | undefined =
            Report.getInstance()?.getItem(+id);

          let categories: IncomesType | ExpensesType = [];
          if (type && category && data) {
            type.addEventListener("change", async (e: Event): Promise<void> => {
              if ((type as HTMLInputElement).value === "income") {
                categories = await Income.get().then(
                  (pr: Income) => pr.incomes,
                );
              } else {
                categories = await Expenses.get().then(
                  (pr: Expenses) => pr.expenses,
                );
              }
              category.innerHTML = "";
              categories.forEach((it: IncomeResponseType): void => {
                const option: HTMLOptionElement =
                  document.createElement("option");
                option.value = it.id.toString();
                option.innerText = it.title;
                category.appendChild(option);
              });
            });

            if (data.type === "income") {
              categories = await Income.get().then((pr: Income) => pr.incomes);
            } else {
              categories = await Expenses.get().then(
                (pr: Expenses) => pr.expenses,
              );
            }
            category.innerHTML = "";
            categories.forEach((it: IncomeResponseType): void => {
              const option: HTMLOptionElement =
                document.createElement("option");
              option.value = it.id.toString();
              option.innerText = it.title;
              option.selected = it.title === data.category;
              category.appendChild(option);
            });
            (type as HTMLInputElement).value = data.type;

            (amount as HTMLInputElement).value = data.amount.toString();
            (date as HTMLInputElement).value = data.date;
            (comment as HTMLInputElement).value = data.comment;

            const saveBtnElement: HTMLElement | null =
              document.getElementById("operation-save");
            if (saveBtnElement) {
              saveBtnElement.addEventListener(
                "click",
                async (e: MouseEvent): Promise<void> => {
                  e.preventDefault();
                  const data = {
                    type: (type as HTMLInputElement).value,
                    category_id: +(category as HTMLInputElement).value,
                    amount: +(amount as HTMLInputElement).value,
                    date: (date as HTMLInputElement).value,
                    comment: (comment as HTMLInputElement).value,
                  };
                  await Report.get().then((pr: Report) => pr.edit(+id, data));
                  await this.redirect("/income-and-expenses");
                },
              );
            }
          }
        },
        unload: (): void => {
          this.deactivateLink("income-and-expenses-link");
        },
      },
      {
        route: "/income-and-expenses/add",
        title: "Добавить",
        filePathTemplate: "/templates/pages/income-and-expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (): Promise<void> => {
          this.activeLink("income-and-expenses-link");
          const search: string = window.location.search;
          const typeElement: HTMLElement | null =
            document.getElementById("type");
          const select: HTMLElement | null =
            document.getElementById("category");
          const amountElement: HTMLElement | null =
            document.getElementById("amount");
          const dateElement: HTMLElement | null =
            document.getElementById("date");
          const commentElement: HTMLElement | null =
            document.getElementById("comment");
          const btnElement: HTMLElement | null =
            document.getElementById("create-btn");

          let categories: IncomesType | ExpensesType = [];
          if (typeElement && amountElement && dateElement && commentElement) {
            typeElement.addEventListener(
              "change",
              async (e: Event): Promise<void> => {
                if ((typeElement as HTMLInputElement).value === "income") {
                  categories = await Income.get().then(
                    (pr: Income) => pr.incomes,
                  );
                } else {
                  categories = await Expenses.get().then(
                    (pr: Expenses) => pr.expenses,
                  );
                }
                (select as HTMLInputElement).innerHTML = "";
                const option: HTMLOptionElement =
                  document.createElement("option");
                option.innerText = "Выберете категорию";
                option.selected = true;
                (select as HTMLInputElement).appendChild(option);
                categories.forEach((category: ExpenseResponseType): void => {
                  const option: HTMLOptionElement =
                    document.createElement("option");
                  option.value = category.id.toString();
                  option.innerText = category.title;
                  (select as HTMLInputElement).appendChild(option);
                });
              },
            );

            const option: HTMLOptionElement = document.createElement("option");
            option.innerText = "Выберете категорию";
            option.selected = true;
            (select as HTMLInputElement).appendChild(option);
            if (search.slice(1, search.length) === "income") {
              (typeElement as HTMLInputElement).value = "income";
              categories = await Income.get().then((pr: Income) => pr.incomes);
            } else if (search.slice(1, search.length) === "expense") {
              (typeElement as HTMLInputElement).value = "expense";
              categories = await Expenses.get().then(
                (pr: Expenses) => pr.expenses,
              );
            }
            categories.forEach((category: ExpenseResponseType): void => {
              const option: HTMLOptionElement =
                document.createElement("option");
              option.value = category.id.toString();
              option.innerText = category.title;
              (select as HTMLInputElement).appendChild(option);
            });

            if (btnElement)
              btnElement.addEventListener(
                "click",
                async (e: MouseEvent): Promise<void> => {
                  await Report.get().then((pr: Report) =>
                    pr.add({
                      type: (typeElement as HTMLInputElement).value,
                      category_id: +(select as HTMLInputElement).value,
                      amount: +(amountElement as HTMLInputElement).value,
                      date: (dateElement as HTMLInputElement).value,
                      comment: (commentElement as HTMLInputElement).value,
                    }),
                  );
                  await this.redirect("/income-and-expenses");
                },
              );
          }
        },
        unload: (): void => {
          this.deactivateLink("income-and-expenses-link");
        },
      },
      {
        route: "/404",
        title: "Страница не найдена",
        filePathTemplate: "/templates/pages/404.html",
      },
      {
        route: "/login",
        title: "Авторизация",
        filePathTemplate: "/templates/pages/auth/login.html",
        load: (): void => {
          const appElement: HTMLElement | null = document.getElementById("app");
          if (appElement)
            appElement.className =
              "d-flex align-items-center py-4 bg-body-tertiary h-100";
          new Login(this.redirect.bind(this));
        },
        unload: () => {
          const appElement: HTMLElement | null = document.getElementById("app");
          if (appElement) appElement.className = "";
        },
      },
      {
        route: "/logout",
        load: (): void => {
          new Logout(this.redirect.bind(this));
        },
      },
      {
        route: "/signup",
        title: "Регистрация",
        filePathTemplate: "/templates/pages/auth/signup.html",
        load: (): void => {
          const appElement: HTMLElement | null = document.getElementById("app");
          if (appElement)
            appElement.className =
              "d-flex align-items-center py-4 bg-body-tertiary h-100";
          new SignUp(this.redirect.bind(this));
        },
        unload: (): void => {
          const appElement: HTMLElement | null = document.getElementById("app");
          if (appElement) appElement.className = "";
        },
      },
    ];
  }

  eventInit(): void {
    window.addEventListener("DOMContentLoaded", this.render.bind(this));
    window.addEventListener("popstate", this.render.bind(this));
    document.addEventListener("click", this.openNewRoute.bind(this));
  }

  async openNewRoute(e: Event): Promise<void> {
    let element = null;
    if (!e.target) return;
    if ((e.target as Element).nodeName === "A") {
      element = e.target as Element;
    } else if ((e.target as Element).parentNode?.nodeName === "A") {
      element = (e.target as Element).parentNode;
    } else if ((e.target as Element).parentNode?.parentNode?.nodeName === "A") {
      element = (e.target as Element).parentNode?.parentNode;
    }

    if (element) {
      e.preventDefault();
      e.stopPropagation();
      const url: string = (element as HTMLLinkElement).href.replace(
        window.location.origin,
        "",
      );
      if (!url || url === "/#" || url.startsWith("javascript:void(0)")) {
        return;
      }

      await this.redirect(url, {
        id: (element as Element).getAttribute("data-id"),
      });
    }
  }

  async render(
    e: Event | null,
    oldRoute: string | null = null,
    args: any | undefined = undefined,
  ): Promise<void> {
    if (oldRoute) {
      const currentRoute: Route | undefined = this.routes.find(
        (item: Route): boolean => item.route === oldRoute,
      );
      if (currentRoute) {
        if (currentRoute.styles && currentRoute.styles.length > 0) {
          currentRoute.styles.forEach((style: string): void => {
            const el: Element | null = document.querySelector(
              `link[href='/css/${style}']`,
            );
            if (el) {
              el.parentNode?.removeChild(el);
            }
          });
        }

        if (currentRoute.unload && typeof currentRoute.unload === "function") {
          await currentRoute.unload();
        }
      }

      if (currentRoute?.useModals) {
        const el: HTMLElement | null = document.getElementById("modal-wrapper");
        if (el) {
          document.body.removeChild(el);
        }
      }
    }

    const urlRoute: string = window.location.pathname;
    const newRoute: Route | undefined = this.routes.find(
      (item: Route): boolean => item.route === urlRoute,
    );

    if (newRoute) {
      if (newRoute.auth && !Auth.getAuthInfo(Auth.accessTokenKey)) {
        return this.redirect("/login");
      }

      if (newRoute.auth && !oldRoute) {
        await User.getUser();
      }

      if (newRoute.styles && newRoute.styles.length > 0) {
        newRoute.styles.forEach((style: string): void => {
          const link: HTMLLinkElement = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "/css/" + style;
        });
      }
      if (newRoute.title) {
        if (this.titlePageElement)
          this.titlePageElement.innerText = newRoute.title;
      }

      if (newRoute.filePathTemplate) {
        let contentBlock: HTMLElement | null = this.contentPageElement;
        if (newRoute.useLayout) {
          const currentRoute: Route | undefined = this.routes.find(
            (item: Route): boolean => item.route === oldRoute,
          );

          if (!oldRoute || currentRoute?.useLayout !== newRoute.useLayout) {
            if (this.contentPageElement)
              this.contentPageElement.innerHTML = await fetch(
                newRoute.useLayout,
              ).then((result: Response) => result.text());
            await this.drawMenu();
          }
          await this.updateBalance();
          contentBlock = document.getElementById("content-layout");
        }
        document.body.classList.remove();
        if (contentBlock)
          contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(
            (result) => result.text(),
          );
      }

      if (newRoute.useModals) {
        const modal = await fetch(newRoute.useModals).then((result) =>
          result.text(),
        );

        const div: HTMLElement = document.createElement("div");
        div.setAttribute("id", "modal-wrapper");
        div.innerHTML = modal;
        document.body.appendChild(div);
      }

      if (newRoute.load && typeof newRoute.load === "function") {
        await newRoute.load(args);
      }
    } else {
      await this.redirect("/404");
    }
  }

  async redirect(path: string, args: any = null): Promise<void> {
    const { pathname: currentRoute } = window.location;
    window.history.pushState({}, "", path);
    await this.render(null, currentRoute, args);
  }

  loadCollapse(nameLink: string): void {
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/income-and-expenses"
    ) {
      const collapseOne: HTMLElement | null =
        document.getElementById("collapseOne");
      const collapseButton: HTMLElement | null =
        document.getElementById("collapse-button");
      if (collapseOne) collapseOne.classList.add("show");
      if (collapseButton) {
        collapseButton.setAttribute("aria-expanded", "true");
        collapseButton.classList.remove("collapsed");
      }
    }

    this.activeLink(nameLink);
  }

  unloadCollapse(nameLink: string): void {
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/income-and-expenses"
    ) {
      const collapseOne: HTMLElement | null =
        document.getElementById("collapseOne");
      const collapseButton: HTMLElement | null =
        document.getElementById("collapse-button");
      if (collapseOne) collapseOne.classList.remove("show");
      if (collapseButton) {
        collapseButton.setAttribute("aria-expanded", "false");
        collapseButton.classList.add("collapsed");
      }
    }

    this.deactivateLink(nameLink);
  }

  activeLink(nameLink: string): void {
    const link: HTMLElement | null = document.getElementById(nameLink);
    if (link) {
      link.classList.remove("link-dark");
      link.classList.add("active");
    }
  }

  deactivateLink(nameLink: string): void {
    const link: HTMLElement | null = document.getElementById(nameLink);
    if (link) {
      link.classList.remove("active");
      link.classList.add("link-dark");
    }
  }

  async drawMenu(): Promise<void> {
    const dropdownElement: HTMLElement | null =
      document.getElementById("dropdown-menu");
    const user: User = await User.getUser();
    if (user && dropdownElement) {
      dropdownElement.innerText = user.name + " " + user.lastName;
      const dropdown: Dropdown = new Dropdown(dropdownElement);
      dropdownElement.addEventListener("click", (e) => {
        dropdown.toggle();
      });
    }
  }

  private async updateBalance(): Promise<void> {
    const balanceElement: HTMLElement | null =
      document.getElementById("balance");
    if (balanceElement)
      balanceElement.innerText = (await User.getBalance()) + "$";
  }
}
