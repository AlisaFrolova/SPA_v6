import { createEl } from "../../tools/DOM_tools.js"
import createReturnButton from "./createReturnButton.js"
import createButtons from "./cardButtons.js"
import { createPost } from "../../tools/PostTools/PostTools.js"

export default function createUserCard(userInfo){ 
    const card = createEl("div", "", "userCard")

    card.append(createEl("p", `Username: ${userInfo.username}`, "userCardText"))
    card.append(createEl("p", `ID: ${userInfo.id}`, "userCardText"))
    
    const viewButton = createEl("button", "View...", "button")
    viewButton.addEventListener("click", () => {
        card.remove()
        createFullUserCard(userInfo)
    })
    card.append(viewButton)

    return card
}

function createFullUserCard(userInfo){
    const container = document.querySelector(".userInfoContainer")
    if(!container) return
    container.innerHTML = ""
        
    container.append(createReturnButton())
    container.append(createEl("p", `Username: ${userInfo.username}`, "userCardText"))
    container.append(createEl("p", `ID: ${userInfo.id}`, "userCardText"))
    container.append(createEl("p", `Bio: ${userInfo.bio}`, "userCardText"))
        
    container.append(createButtons(container, userInfo))

    const postsContainer = createEl("div", "", "postsContainer")
    container.append(postsContainer)
    for (const post of userInfo.posts) {
        postsContainer.append(createPost(userInfo.id, post))
        const postMark = document.querySelector(".postMark")
        if(postMark) postMark.remove()
        const updateLink = document.querySelector(".post > .link")
        if(updateLink) updateLink.remove()
    }
}