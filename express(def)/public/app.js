import { initRouter } from "./src/router.js";

fetch("/read", { method: 'GET', headers: { 'Content-Type': 'application/json' }})
.then(() => {return initRouter()})

window.addEventListener("popstate", () => { //(?)
    router(location.pathname);
});