import { createPost } from "../../../tools/PostTools/PostTools.js"
import { getUser, getMethod } from "../../../tools/API_tools.js"
import { createEl, createInputBlock } from "../../../tools/DOM_tools.js"

export default function spawnProfile(id){
    const profile = createEl("section", "", "profile")

    const profileInfoContainer = createEl("div", "", "profileInfoContainer")
    profile.append(profileInfoContainer)

        const errorText = createEl("p", "User was not found", "errorText")

        getUser(id).then(user => {
        localStorage.setItem("userId", id)
        if(!user){ profileInfoContainer.append(errorText); return}
        profileInfoContainer.append(createEl("p", user.username, "usernameText"))
        profileInfoContainer.append(createEl("p", id, "idText"))
        profileInfoContainer.append(createEl("p", user.bio, "bioText"))

        const postsContainer = createEl("div", "", "postsContainer")
        getMethod("/api/userId").then(res => {
            if(user.posts){
                for (const post of user.posts) {
                    postsContainer.append(createPost(res.id, post))
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