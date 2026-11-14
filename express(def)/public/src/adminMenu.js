import { createEl, spawnSearchBox } from "./tools/DOM_tools.js"
import { isAdmin, postMethod } from "./tools/API_tools.js"
import tokenData from "./tokenModule.js"
import createPost from "./views/communityView/Components/createPost.js"
import updateProfileSection from "./views/profileView/Modules/updateProfile.js"
//import updatePassSection from "./views/profileView/Modules/updatePassword.js"

export default function spawnAdminMenu(){
    const button = createEl("button", "Admin", "adminMenuButton")
    button.addEventListener("click", () => {
        const section = createEl("section", "", "adminMenu")
        document.body.append(section)
        createMenu()
    })
    document.querySelector(".buttonContainer").append(button)
}

function createMenu(){
   const section = document.querySelector(".adminMenu")

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

function spawnInfoContainer(){// -> &I
    const section = document.querySelector(".adminMenu")

    const infoContainer = document.querySelector(".userInfoContainer")
    if(!infoContainer) return
    infoContainer.innerHTML = ""
    infoContainer.append(spawnSearchBox(() => {
        const prevCard = document.querySelector(".userCard")
        if(prevCard) prevCard.remove()

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
            }
        })
    }))
}

function createUserCard(userInfo){ //-> &I
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

function createFullUserCard(userInfo){// -> &I
    const container = document.querySelector(".userInfoContainer")
    if(!container) return
    container.innerHTML = ""
        
    const returnButton = createEl("button", "Return...", "button")
    returnButton.addEventListener("click", () => {
        spawnInfoContainer()
    })
    container.append(returnButton)
    container.append(createEl("p", `Username: ${userInfo.username}`, "userCardText"))
    container.append(createEl("p", `ID: ${userInfo.id}`, "userCardText"))
    container.append(createEl("p", `Bio: ${userInfo.bio}`, "userCardText"))
        
    const buttonsContainer = createEl("div", "", "userButtonsContainer")

    const updateProfileButton = createEl("button", "Update Profile", "button")
    updateProfileButton.addEventListener("click", () => {
        container.innerHTML = ""
        localStorage.setItem("userId", userInfo.id)
        container.append(updateProfileSection())
    })
    buttonsContainer.append(updateProfileButton)

    //const updatePassButton = createEl()

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
    container.append(buttonsContainer)

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
