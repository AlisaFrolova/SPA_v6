import { createEl, spawnSearchBox } from "../../tools/DOM_tools.js"
import { checkToken } from "../../tools/API_tools.js"
import tokenData from "../../tokenModule.js"
import createUserCard from "../Components/userCard.js"

export default function spawnInfoContainer(){
    const section = document.querySelector(".adminMenu")

    const infoContainer = document.querySelector(".userInfoContainer")
    if(!infoContainer) return
    infoContainer.innerHTML = ""
    infoContainer.append(spawnSearchBox(() => {
        const prevCard = document.querySelector(".userCard")
        if(prevCard) prevCard.remove()
        getUsers(section)
    }))
}
function getUsers(section, isRefreshed = false){
    fetch("/api/getUsers", {   
                method: 'GET',
                headers: { 'Content-Type': 'application/json',
                    "authorization": `Bearer ${tokenData.getAccessToken()}` }
            }).then(res => {
                if(res.status === 200){
                    res.json().then(data => {
                        const userIndex = data.findIndex(user => user.username === searchInput.value)
                        if(userIndex === -1) {
                            const errorMessage = createEl("p", "User was not found", "errorText")
                            section.append(errorMessage)
                            setTimeout(() => {errorMessage.remove()}, 2800)
                        }
                        else{
                            section.append(createUserCard(data[userIndex]))
                        }
                    })
                }else{
                    checkToken(isRefreshed, () => {return getUsers(section, true)})
                }
            })
}