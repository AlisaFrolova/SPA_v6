import { createPost } from "../../../tools/PostTools/PostTools.js"
import { getUser, getUserId } from "../../../tools/API_tools.js"
import { createEl, createInputBlock } from "../../../tools/DOM_tools.js"

export default function spawnProfile(id){
    const profile = createEl("section", "", "profile")

    const profileInfoContainer = createEl("div", "", "profileInfoContainer")

    const avatarContainer = createEl("div", "", "avatarContainer")
    avatarContainer.append(createEl("img", "", "avatar"))
    
        getUserId().then(currentId => {
            if(currentId === id){
                const updateButton = createEl("button", "Update", "avatarUpdateButton")
                updateButton.addEventListener("click", () => {
                    profileInfoContainer.append(createInputBlock("avatar", "Choose a profile picture"))
                    const avatarInput = document.querySelector(".avatarInput")
                    if(!avatarInput) return
                    avatarInput.type = "file"
                    avatarInput.accept = "image/png, image/jpeg"

                    const submitButton = createEl("button", "Submit", "button")
                    submitButton.addEventListener("click", () => {
                        const obj = {
                            file: avatarInput.value,
                            id: id
                        }
                        console.log(obj)
                        //fetch blablabla
                    })
                    profileInfoContainer.append(submitButton)
                })
                avatarContainer.append(updateButton)
            }
            profileInfoContainer.append(avatarContainer)
        })
        
        profile.append(profileInfoContainer)

        const errorText = createEl("p", "User was not found", "errorText")

        getUser(id).then(user => {
        localStorage.setItem("userId", id)
        if(!user){ profileInfoContainer.append(errorText); return}
        profileInfoContainer.append(createEl("p", user.username, "usernameText"))
        profileInfoContainer.append(createEl("p", id, "idText"))
        profileInfoContainer.append(createEl("p", user.bio, "bioText"))

        const postsContainer = createEl("div", "", "postsContainer")
        getUserId().then(currentId => {
            if(user.posts){
                for (const post of user.posts) {
                    postsContainer.append(createPost(currentId, post))
                }
                const postsJSON = JSON.stringify(user.posts)
                localStorage.setItem("posts", postsJSON)
            }
            profile.append(postsContainer)
        })
        

        const text = document.querySelector(".errorText")
        if(text) text.remove()
        })

    return profile
}