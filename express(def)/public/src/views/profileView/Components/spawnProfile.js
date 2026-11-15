import { createPost } from "../../../tools/PostTools/PostTools.js"
import { getUser } from "../../../tools/API_tools.js"
import { createEl } from "../../../tools/DOM_tools.js"

export default function spawnProfile(id){
    const profile = createEl("section", "", "profile")

    const errorText = createEl("p", "User was not found", "errorText")

    getUser(id).then(user => {
        localStorage.setItem("userId", id)
        if(!user){ profile.append(errorText); return}
        profile.append(createEl("p", user.username, "usernameText"))
        profile.append(createEl("p", id, "idText"))
        profile.append(createEl("p", user.bio, "bioText"))

        const postsContainer = createEl("div", "", "postsContainer")
        if(user.posts){
            for (const post of user.posts) {
                postsContainer.append(createPost(id, post))
            }
            const postsJSON = JSON.stringify(user.posts)
            localStorage.setItem("posts", postsJSON)
        }
        profile.append(postsContainer)

        const text = document.querySelector(".errorText")
        if(text) text.remove()
        })

    return profile
}