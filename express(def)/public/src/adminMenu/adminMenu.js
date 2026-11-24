import { createEl } from "../tools/DOM_tools.js"
import spawnInfoContainer from "./Modules/spawnInfo.js"

export default function spawnAdminMenu(){
    const button = createEl("button", "Admin", "adminMenuButton")
    const section = createEl("section", "", "adminMenu")
    button.addEventListener("click", () => {
        document.body.append(section)
        createMenu()
    })
    document.querySelector(".buttonContainer").append(button)
}

function createMenu(){
   const section = document.querySelector(".adminMenu")
   if(!section) return
   section.innerHTML = ""

    const returnButton = createEl("button", "X", "button")
    returnButton.addEventListener("click", () => {
        section.remove()
    })
    const headerContainer = createEl("h3", "Admin Menu", "header")
    headerContainer.append(returnButton)
    section.append(headerContainer)

    section.append(createEl("div", "", "userInfoContainer"))
    spawnInfoContainer()
}