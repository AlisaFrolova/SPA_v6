import { createEl, createInputBlock } from "../../tools/DOM_tools.js"
import { postMethod } from "../../tools/API_tools.js"
import updateProfileSection from "../../views/profileView/Modules/updateProfile.js"//!
import createReturnButton from "./createReturnButton.js"

export default function createButtons(container, userInfo){
    const buttonsContainer = createEl("div", "", "userButtonsContainer")

    const updateProfileButton = createEl("button", "Profile", "button")
    updateProfileButton.addEventListener("click", () => {
        container.innerHTML = ""
        localStorage.setItem("userId", userInfo.id)
        container.append(updateProfileSection())
        container.append(createReturnButton())
    })
    buttonsContainer.append(updateProfileButton)

    const updatePassButton = createEl("button", "Password", "button")
    updatePassButton.addEventListener("click", () => {
        container.innerHTML = ""
        container.append(createInputBlock("pass", "Enter new password"))
        const submitButton = createEl("button", "Submit", "button")
        submitButton.addEventListener("click", () => {
            const passInput = document.querySelector(".passInput")
            if(!passInput) return
            
            postMethod({userId: userInfo.id, newPass: passInput.value}, "/api/updateUsersPass").then(res => {
                const message = createEl("p", "", "errorText")
                if(res){ 
                    message.textContent = "Password was updated"
                }
                else{
                    message.textContent = "Password was not updated"
                }
                container.prepend(message)
            })
        })
        container.append(submitButton)
        container.append(createReturnButton())
    })
    buttonsContainer.append(updatePassButton)

    const deleteUserButton = createEl("button", "Delete", "button")
    deleteUserButton.addEventListener("click", () => {
        postMethod({id: userInfo.id}, "/api/deleteUser").then(res => {
            const message = createEl("p", "", "errorText")
            if(res){ 
                message.textContent = "User was deleted"
            }
            else{
                message.textContent = "User was not deleted"
            }
            container.prepend(message)
        })
    })
    buttonsContainer.append(deleteUserButton)

    return buttonsContainer
}