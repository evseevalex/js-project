import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { Router } from "./router";

class App {
  constructor() {
    new Router();
  }
}

new App();
