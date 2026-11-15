import { createEl } from "../../tools/DOM_tools.js"
import spawnInfoContainer from "../Modules/spawnInfo.js"

export default function createReturnButton(){
    const returnButton = createEl("button", "Return...", "button")
    returnButton.addEventListener("click", () => {
        spawnInfoContainer()
    })
    return returnButton
}