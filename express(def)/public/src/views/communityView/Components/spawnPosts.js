import { getValueFromLocalStorage } from "../../../tools/DataTools.js"
import { getMethod } from "../../../tools/API_tools.js"
import { createPost } from "../../../tools/PostTools/PostTools.js"

export default function spawnPosts(container){
    container.innerHTML = ""
    getMethod("/api/userId").then(res => { 
        let posts= getValueFromLocalStorage("posts")

        let endIndex = 5*parseInt(localStorage.getItem("pageNumber"))
        let startIndex = endIndex-5
        if(endIndex > posts.length) {
            endIndex = posts.length
        }
        posts = posts.slice(startIndex, endIndex)

        if(!res) return 
        for (const post of posts) {
            container.append(createPost(res.id, post))
        }
    })
}