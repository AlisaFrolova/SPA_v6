import { getValueFromLocalStorage } from "../../../tools/DataTools.js"
import { getUserId } from "../../../tools/API_tools.js"
import { createPost } from "../../../tools/PostTools/PostTools.js"

export default function spawnPosts(container){
    container.innerHTML = ""
    getUserId().then(id => { 
        let posts= getValueFromLocalStorage("posts")

        let endIndex = 5*parseInt(localStorage.getItem("pageNumber"))
        let startIndex = endIndex-5
        if(endIndex > posts.length) {
            endIndex = posts.length
        }
        posts = posts.slice(startIndex, endIndex)

        for (const post of posts) {
            container.append(createPost(id, post))
        }
    })
}