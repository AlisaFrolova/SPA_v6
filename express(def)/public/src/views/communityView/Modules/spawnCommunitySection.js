import { getPosts, spawnPosts } from "../../../tools/PostTools/PostTools.js"
import { createEl, spawnNav } from "../../../tools/DOM_tools.js"
import { getMethod } from "../../../tools/API_tools.js"

export default function spawnCommunitySection(){
    const cardsContainer = createEl("section", "", "postsContainer")

    const loadingText = createEl("p", "Loading posts...", "loadingText")
    cardsContainer.append(loadingText)

    getPosts().then(res => {
        loadingText.remove()
        if(res){
            getMethod("/api/userId").then(userId => {
                if(!userId) return
                spawnPosts(userId, cardsContainer, 5)
                const navigation = createEl("div", "", "navContainer")
                cardsContainer.after(navigation)
                spawnNav(() => {spawnPosts(userId, cardsContainer, 5)})
            })
            
        }else{
            cardsContainer.append(createEl("p", "No posts yet ...", "errorText"))
        }
    })

    return cardsContainer
}