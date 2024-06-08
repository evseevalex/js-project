import { Dashboard } from "./components/dashboard";
import { Login } from "./components/auth/login";
import { Logout } from "./components/auth/logout";
import { SignUp } from "./components/auth/signup";
import { Auth } from "./services/auth";

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
        load: () => {
          new Dashboard();
        },
        unload: () => {},
      },
      {
        route: "/expenses",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/index.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/expenses/add",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/expenses/edit",
        title: "Расходы",
        filePathTemplate: "/templates/pages/expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income",
        title: "Доходы",
        filePathTemplate: "/templates/pages/income/index.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income/edit",
        title: "Редактировать доходы",
        filePathTemplate: "/templates/pages/income/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income/add",
        title: "Добавить доходы",
        filePathTemplate: "/templates/pages/income/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income-and-expenses",
        title: "Доходы и расходы",
        filePathTemplate: "/templates/pages/income-and-expenses/index.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income-and-expenses/edit",
        title: "Редактировать",
        filePathTemplate: "/templates/pages/income-and-expenses/edit.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
      },
      {
        route: "/income-and-expenses/add",
        title: "Добавить",
        filePathTemplate: "/templates/pages/income-and-expenses/add.html",
        useLayout: "/templates/layout.html",
        auth: true,
        load: () => {
          // new Dashboard()
        },
        unload: () => {},
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
    }

    if (element) {
      e.preventDefault();
      const url = element.href.replace(window.location.origin, "");
      console.log(url);
      if (!url || url === "/#" || url.startsWith("javascript:void(0)")) {
        return;
      }

      await this.redirect(url);
    }
  }

  async render(e, oldRoute = null) {
    if (oldRoute) {
      const currentRoute = this.routes.find((item) => item.route === oldRoute);
      if (currentRoute) {
        if (currentRoute.styles && currentRoute.styles.length > 0) {
          currentRoute.styles.forEach((style) => {
            document.querySelector(`link[href='/css/${style}']`).remove();
          });
        }

        if (currentRoute.unload && typeof currentRoute.unload === "function") {
          currentRoute.unload();
        }
      }
    }

    const urlRoute = window.location.pathname;
    const newRoute = this.routes.find((item) => item.route === urlRoute);

    if (newRoute) {
      if (newRoute.auth && !Auth.getAuthInfo(Auth.accessTokenKey)) {
        return this.redirect("/login");
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
          this.contentPageElement.innerHTML = await fetch(
            newRoute.useLayout,
          ).then((result) => result.text());
          contentBlock = document.getElementById("content-layout");
        }
        document.body.classList.remove();
        contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(
          (result) => result.text(),
        );
      }

      if (newRoute.load && typeof newRoute.load === "function") {
        newRoute.load();
      }
    } else {
      await this.redirect("/404");
    }
  }

  async redirect(path) {
    const { pathname: currentRoute } = window.location;
    window.history.pushState({}, "", path);
    await this.render(null, currentRoute);
  }
}
