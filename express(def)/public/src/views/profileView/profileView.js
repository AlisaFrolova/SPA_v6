import spawnProfile from "./Components/spawnProfile.js"
import { logout } from "../../tools/authTools.js"
import { createEl, spawnSearchBox, createLink } from "../../tools/DOM_tools.js"
import { postMethod, getMethod, checkToken } from "../../tools/API_tools.js"
import tokenData from "../../tokenModule.js"

function getUserByUsername(username, section, isRefreshed = false){
    fetch("/api/userByUsername", {   
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    "authorization": `Bearer ${tokenData.getAccessToken()}` },
                body: JSON.stringify({username: username})
            }).then(res => () => {
                if(res.status === 200){
                    res.json().then(user => {
                        section.append(spawnProfile(user.id))
                    })
                }else{
                    checkToken(isRefreshed, () => {return getUserByUsername(username, section, true)})
                }
            })
}

export default function profileView(){
    const section = createEl("section", "", "profileSection")

    section.append(createEl("h1", "Profile", "header"))

    section.append(spawnSearchBox(() => {
        const profile = document.querySelector(".profile")
        if(profile) profile.remove()

        const text = document.querySelector(".profileText")
        if(text) text.textContent = `${searchInput.value} profile:`
        getUserByUsername(searchInput.value, section)

        const container = document.querySelector(".buttonsContainer")
        if(container) container.remove()
    }))

    section.append(createEl("p", "Your profile:", "profileText"))

    getMethod("/api/userId").then(res => {
        if(!res) return
        const id = res.id
        
        localStorage.setItem("userId", id)

        section.append(spawnProfile(id))

        const container = createEl("div", "", "buttonsContainer")
        container.append(createLink("Update Profile", "/profile/update"))
        container.append(createLink("Update Password", "/profile/password"))
        
        const deleteButton = createEl("button", "Delete", "button")
        deleteButton.addEventListener("click", () => {
            postMethod({id: id}, "/api/deleteUser").then(res => {
                if(res){ logout() }
                else{
                    const errorMessage = createEl("p", "User was not deleted", "errorText")
                    container.append(errorMessage)
                }
            })
        })
        container.append(deleteButton)
        section.append(container)
    })

    return section
}