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

export class Router {
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
        load: async () => {
          this.activeLink("home-link");
          const dashboard = new Dashboard();
          await dashboard.renderCharts();
          for (const radio of document.querySelectorAll(
            'input[name="filter"]',
          )) {
            if (
              (await Report.getInstance().getFilter().period) === radio.value
            ) {
              radio.checked = true;
            }
          }
        },
        unload: () => {
          this.deactivateLink("home-link");
        },
      },
      {
        route: "/expenses",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/index.html",
        useLayout: "/templates/layout.html",
        useModals: "/templates/pages/expenses/modal.html",
        auth: true,
        load: async () => {
          this.loadCollapse("expenses-link");
          await Expenses.get().then((pr) => pr.view());
          const modalElement = document.getElementById("exampleModalToggle");
          const deleteElement = document.getElementById("expense-delete");
          const cancelElement = document.getElementById("expense-cancel");

          let eventDelete = null;
          let modal = new Modal(modalElement);
          Array.from(document.getElementsByClassName("modal-delete")).forEach(
            (el) => {
              el.addEventListener("click", (e) => {
                modal.show(e.target);
              });
            },
          );

          modalElement.addEventListener("hidePrevented.bs.modal", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("show.bs.modal", (bootstrapEvent) => {
            eventDelete = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              let id = bootstrapEvent.relatedTarget.getAttribute("data-id");
              await Expenses.get().then((pr) => pr.delete(id));
              await Expenses.get().then((pr) => pr.view());
              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.target);
                });
              });
              modal.hide();
            };
            deleteElement.addEventListener("click", eventDelete);
          });

          cancelElement.addEventListener("click", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("hidden.bs.modal", (e) => {
            deleteElement.removeEventListener("click", eventDelete);
          });
        },
        unload: () => {
          this.unloadCollapse("expenses-link");
        },
      },
      {
        route: "/expenses/add",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async () => {
          this.loadCollapse("expenses-link");
          document
            .getElementById("expense-create")
            .addEventListener("click", async (e) => {
              e.preventDefault();
              const title = document.getElementById("title-input").value;
              await Expenses.get().then((pr) => pr.add(title));
              await this.redirect("/expenses");
            });
        },
        unload: () => {
          this.unloadCollapse("expenses-link");
        },
      },
      {
        route: "/expenses/edit",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args) => {
          this.loadCollapse("expenses-link");
          const { id } = args;
          const title = document.getElementById("title");
          title.value = Expenses.getInstance().getItem(+id).title;
          document
            .getElementById("expense-save")
            .addEventListener("click", async (e) => {
              e.preventDefault();

              await Expenses.get().then((pr) => pr.edit(+id, title.value));
              await this.redirect("/expenses");
            });
        },
        unload: () => {
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
        load: async () => {
          this.loadCollapse("income-link");
          await Income.get().then((pr) => pr.view());

          const modalElement = document.getElementById("exampleModalToggle");
          const deleteElement = document.getElementById("income-delete");
          const cancelElement = document.getElementById("income-cancel");

          let eventDelete = null;
          let modal = new Modal(modalElement);
          Array.from(document.getElementsByClassName("modal-delete")).forEach(
            (el) => {
              el.addEventListener("click", (e) => {
                modal.show(e.target);
              });
            },
          );

          modalElement.addEventListener("hidePrevented.bs.modal", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("show.bs.modal", (bootstrapEvent) => {
            eventDelete = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              let id = bootstrapEvent.relatedTarget.getAttribute("data-id");
              await Income.get().then((pr) => pr.delete(id));
              await Income.get().then((pr) => pr.view());
              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.target);
                });
              });
              modal.hide();
            };
            deleteElement.addEventListener("click", eventDelete);
          });

          cancelElement.addEventListener("click", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("hidden.bs.modal", (e) => {
            deleteElement.removeEventListener("click", eventDelete);
          });
        },
        unload: () => {
          this.unloadCollapse("income-link");
        },
      },
      {
        route: "/income/edit",
        title: "Редактировать доходы",
        filePathTemplate: "/templates/pages/income/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args) => {
          this.loadCollapse("income-link");
          const { id } = args;
          const title = document.getElementById("title");
          title.value = Income.getInstance().getItem(+id).title;
          document
            .getElementById("income-save")
            .addEventListener("click", async (e) => {
              e.preventDefault();
              await Income.get().then((pr) => pr.edit(+id, title.value));
              await this.redirect("/income");
            });
        },
        unload: () => {
          this.unloadCollapse("income-link");
        },
      },
      {
        route: "/income/add",
        title: "Добавить доходы",
        filePathTemplate: "/templates/pages/income/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async () => {
          this.loadCollapse("income-link");
          document
            .getElementById("income-create")
            .addEventListener("click", async (e) => {
              e.preventDefault();
              const title = document.getElementById("title-input").value;
              await Income.get().then((pr) => pr.add(title));
              await this.redirect("/income");
            });
        },
        unload: () => {
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
        load: async () => {
          this.activeLink("income-and-expenses-link");
          let dateFrom = flatpickr("#dateFrom");
          let dateTo = flatpickr("#dateTo");

          const modalElement = document.getElementById("exampleModalToggle");
          const deleteElement = document.getElementById("operation-delete");
          const cancelElement = document.getElementById("operation-cancel");

          let eventDelete = null;
          let modal = new Modal(modalElement);

          dateFrom.config.onChange.push(
            async (selectedDates, dateStr, instance) => {
              filter.dateFrom = dateStr;
              await Report.get().then(async (pr) => {
                pr.setFilter(filter);
                await pr.init();
                await pr.view();
              });
              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.currentTarget);
                });
              });
            },
          );

          dateTo.config.onChange.push(
            async (selectedDates, dateStr, instance) => {
              filter.dateTo = dateStr;
              await Report.get().then(async (pr) => {
                pr.setFilter(filter);
                await pr.init();
                await pr.view();
              });
              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.currentTarget);
                });
              });
            },
          );

          let filter = {};
          for (const radio of document.querySelectorAll(
            'input[name="filter"]',
          )) {
            if (
              radio.value ===
              (await Report.get().then((rp) => rp.getFilter().period))
            ) {
              radio.checked = true;
            }
            radio.addEventListener("change", async () => {
              filter.period = radio.value;
              dateFrom.input.setAttribute("disabled", "disabled");
              dateTo.input.setAttribute("disabled", "disabled");
              if (radio.value === "today") {
                filter.dateFrom = new Date().toISOString().slice(0, 10);
                filter.dateTo = new Date().toISOString().slice(0, 10);
              } else if (radio.value === "interval") {
                dateFrom.input.removeAttribute("disabled");
                dateTo.input.removeAttribute("disabled");
                filter.dateFrom = new Date(1907, 1, 1)
                  .toISOString()
                  .slice(0, 10);
                filter.dateTo = new Date().toISOString().slice(0, 10);
              }

              Report.getInstance().setFilter(filter);

              await Report.get().then(async (pr) => {
                await pr.view();
              });

              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.currentTarget);
                });
              });
            });
          }

          await Report.get().then(async (pr) => {
            await pr.init();
            await pr.view();
          });

          Array.from(document.getElementsByClassName("modal-delete")).forEach(
            (el) => {
              el.addEventListener("click", (e) => {
                modal.show(e.currentTarget);
              });
            },
          );

          modalElement.addEventListener("hidePrevented.bs.modal", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("show.bs.modal", (bootstrapEvent) => {
            eventDelete = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              let id = bootstrapEvent.relatedTarget.getAttribute("data-id");
              await Report.get().then((pr) => pr.delete(+id));
              await Report.get().then((pr) => pr.view());
              Array.from(
                document.getElementsByClassName("modal-delete"),
              ).forEach((el) => {
                el.addEventListener("click", (e) => {
                  modal.show(e.currentTarget);
                });
              });
              modal.hide();
            };
            deleteElement.addEventListener("click", eventDelete);
          });

          cancelElement.addEventListener("click", (e) => {
            e.preventDefault();
            modal.hide();
          });

          modalElement.addEventListener("hidden.bs.modal", (e) => {
            deleteElement.removeEventListener("click", eventDelete);
          });
        },
        unload: () => {
          this.deactivateLink("income-and-expenses-link");
          document.querySelector("#dateFrom")._flatpickr.destroy();
          document.querySelector("#dateTo")._flatpickr.destroy();
        },
      },
      {
        route: "/income-and-expenses/edit",
        title: "Редактировать",
        filePathTemplate: "/templates/pages/income-and-expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async (args) => {
          this.activeLink("income-and-expenses-link");

          const { id } = args;
          let type = document.getElementById("type");
          let category = document.getElementById("category");
          let amount = document.getElementById("amount");
          let date = document.getElementById("date");
          let comment = document.getElementById("comment");

          let data = Report.getInstance().getItem(+id);

          let categories = [];
          type.addEventListener("change", async (e) => {
            if (type.value === "income") {
              categories = await Income.get().then((pr) => pr.incomes);
            } else {
              categories = await Expenses.get().then((pr) => pr.expenses);
            }
            category.innerHTML = "";
            categories.forEach((it) => {
              const option = document.createElement("option");
              option.value = it.id;
              option.innerText = it.title;
              category.appendChild(option);
            });
          });

          if (data.type === "income") {
            categories = await Income.get().then((pr) => pr.incomes);
          } else {
            categories = await Expenses.get().then((pr) => pr.expenses);
          }
          category.innerHTML = "";
          categories.forEach((it) => {
            const option = document.createElement("option");
            option.value = it.id;
            option.innerText = it.title;
            option.selected = it.title === data.category;
            category.appendChild(option);
          });
          type.value = data.type;

          amount.value = data.amount;
          date.value = data.date;
          comment.value = data.comment;

          document
            .getElementById("operation-save")
            .addEventListener("click", async (e) => {
              e.preventDefault();
              const data = {
                type: type.value,
                category_id: +category.value,
                amount: +amount.value,
                date: date.value,
                comment: comment.value,
              };
              await Report.get().then((pr) => pr.edit(+id, data));
              await this.redirect("/income-and-expenses");
            });
        },
        unload: () => {
          this.deactivateLink("income-and-expenses-link");
        },
      },
      {
        route: "/income-and-expenses/add",
        title: "Добавить",
        filePathTemplate: "/templates/pages/income-and-expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: async () => {
          this.activeLink("income-and-expenses-link");
          const search = window.location.search;
          const typeElement = document.getElementById("type");
          const select = document.getElementById("category");
          const amountElement = document.getElementById("amount");
          const dateElement = document.getElementById("date");
          const commentElement = document.getElementById("comment");
          const btnElement = document.getElementById("create-btn");

          let categories = [];
          typeElement.addEventListener("change", async (e) => {
            if (typeElement.value === "income") {
              categories = await Income.get().then((pr) => pr.incomes);
            } else {
              categories = await Expenses.get().then((pr) => pr.expenses);
            }
            select.innerHTML = "";
            const option = document.createElement("option");
            option.innerText = "Выберете категорию";
            option.selected = true;
            select.appendChild(option);
            categories.forEach((category) => {
              const option = document.createElement("option");
              option.value = category.id;
              option.innerText = category.title;
              select.appendChild(option);
            });
          });

          const option = document.createElement("option");
          option.innerText = "Выберете категорию";
          option.selected = true;
          select.appendChild(option);
          if (search.slice(1, search.length) === "income") {
            typeElement.value = "income";
            categories = await Income.get().then((pr) => pr.incomes);
          } else if (search.slice(1, search.length) === "expense") {
            typeElement.value = "expense";
            categories = await Expenses.get().then((pr) => pr.expenses);
          }
          categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.innerText = category.title;
            select.appendChild(option);
          });

          btnElement.addEventListener("click", async (e) => {
            await Report.get().then((pr) =>
              pr.add({
                type: typeElement.value,
                category_id: +select.value,
                amount: +amountElement.value,
                date: dateElement.value,
                comment: commentElement.value,
              }),
            );
            await this.redirect("/income-and-expenses");
          });
        },
        unload: () => {
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
        load: () => {
          document.getElementById("app").classList =
            "d-flex align-items-center py-4 bg-body-tertiary h-100";
          new Login(this.redirect.bind(this));
        },
        unload: () => {
          document.getElementById("app").classList = "";
        },
      },
      {
        route: "/logout",
        load: () => {
          new Logout(this.redirect.bind(this));
        },
      },
      {
        route: "/signup",
        title: "Регистрация",
        filePathTemplate: "/templates/pages/auth/signup.html",
        load: () => {
          document.getElementById("app").classList =
            "d-flex align-items-center py-4 bg-body-tertiary h-100";
          new SignUp(this.redirect.bind(this));
        },
        unload: () => {
          document.getElementById("app").classList = "";
        },
      },
    ];
  }

  eventInit() {
    window.addEventListener("DOMContentLoaded", this.render.bind(this));
    window.addEventListener("popstate", this.render.bind(this));
    document.addEventListener("click", this.openNewRoute.bind(this));
  }

  async openNewRoute(e) {
    let element = null;
    if (e.target.nodeName === "A") {
      element = e.target;
    } else if (e.target.parentNode.nodeName === "A") {
      element = e.target.parentNode;
    } else if (e.target.parentNode.parentNode.nodeName === "A") {
      element = e.target.parentNode.parentNode;
    }

    if (element) {
      e.preventDefault();
      e.stopPropagation();
      const url = element.href.replace(window.location.origin, "");
      if (!url || url === "/#" || url.startsWith("javascript:void(0)")) {
        return;
      }

      await this.redirect(url, { id: element.getAttribute("data-id") });
    }
  }

  async render(e, oldRoute = null, args) {
    if (oldRoute) {
      const currentRoute = this.routes.find((item) => item.route === oldRoute);
      if (currentRoute) {
        if (currentRoute.styles && currentRoute.styles.length > 0) {
          currentRoute.styles.forEach((style) => {
            const el = document.querySelector(`link[href='/css/${style}']`);
            el.parentNode.removeChild(el);
          });
        }

        if (currentRoute.unload && typeof currentRoute.unload === "function") {
          currentRoute.unload();
        }
      }

      if (currentRoute.useModals) {
        const el = document.getElementById("modal-wrapper");
        if (el) {
          document.body.removeChild(el);
        }
      }
    }

    const urlRoute = window.location.pathname;
    const newRoute = this.routes.find((item) => item.route === urlRoute);

    if (newRoute) {
      if (newRoute.auth && !Auth.getAuthInfo(Auth.accessTokenKey)) {
        return this.redirect("/login");
      }

      if (newRoute.auth && !oldRoute) {
        await User.getUser();
      }

      if (newRoute.styles && newRoute.styles.length > 0) {
        newRoute.styles.forEach((style) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "/css/" + style;
        });
      }
      if (newRoute.title) {
        this.titlePageElement.innerText = newRoute.title;
      }

      if (newRoute.filePathTemplate) {
        let contentBlock = this.contentPageElement;
        if (newRoute.useLayout) {
          const currentRoute = this.routes.find(
            (item) => item.route === oldRoute,
          );

          if (!oldRoute || currentRoute.useLayout !== newRoute.useLayout) {
            this.contentPageElement.innerHTML = await fetch(
              newRoute.useLayout,
            ).then((result) => result.text());
            this.drawMenu();
          }
          document.getElementById("balance").innerText =
            (await User.getBalance()) + "$";
          contentBlock = document.getElementById("content-layout");
        }
        document.body.classList.remove();
        contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(
          (result) => result.text(),
        );
      }

      if (newRoute.useModals) {
        const modal = await fetch(newRoute.useModals).then((result) =>
          result.text(),
        );

        const div = document.createElement("div");
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

  async redirect(path, args = null) {
    const { pathname: currentRoute } = window.location;
    window.history.pushState({}, "", path);
    await this.render(null, currentRoute, args);
  }

  loadCollapse(nameLink) {
    if (
      window.location.pathname !== "/" ||
      window.location.pathname !== "/income-and-expenses"
    ) {
      const collapseOne = document.getElementById("collapseOne");
      const collapseButton = document.getElementById("collapse-button");
      collapseOne.classList.add("show");
      collapseButton.setAttribute("aria-expanded", "true");
      collapseButton.classList.remove("collapsed");
    }

    this.activeLink(nameLink);
  }

  unloadCollapse(nameLink) {
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/income-and-expenses"
    ) {
      const collapseOne = document.getElementById("collapseOne");
      const collapseButton = document.getElementById("collapse-button");
      collapseOne.classList.remove("show");
      collapseButton.setAttribute("aria-expanded", "false");
      collapseButton.classList.add("collapsed");
    }

    this.deactivateLink(nameLink);
  }

  activeLink(nameLink) {
    const link = document.getElementById(nameLink);
    if (link) {
      link.classList.remove("link-dark");
      link.classList.add("active");
    }
  }

  deactivateLink(nameLink) {
    const link = document.getElementById(nameLink);
    if (link) {
      link.classList.remove("active");
      link.classList.add("link-dark");
    }
  }

  drawMenu() {
    const dropdownElement = document.getElementById("dropdown-menu");
    const user = User.getUser();
    if (user) {
      dropdownElement.innerText = user.name + " " + user.lastName;
    }
    const dropdown = new Dropdown(dropdownElement);
    dropdownElement.addEventListener("click", (e) => {
      dropdown.toggle();
    });
  }
}
