import { shortenDescription, getValueFromLocalStorage } from "../DataTools.js"
import { createEl } from "../DOM_tools.js"
import tokenData from "../../tokenModule.js"
import { createStarButton, createInfoText, spawnUpdateAndDeleteButtons, spawnPost, getPostById } from "./Components/postComponents.js"

export function getPosts(){
    return tokenData.refreshAccessToken().then(() => {
        return fetch("/api/posts", {   
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
             "authorization": `Bearer ${tokenData.getAccessToken()}` }
        }).then(res => {
            if(res.status === 200){
                return res.json().then(data => {
                    const postsJSON = JSON.stringify(data)
                    localStorage.setItem("posts", postsJSON)

                    localStorage.setItem("pageNumber", 1)
                    localStorage.setItem("maxPageNumber", Math.ceil(data.length/5))
                    
                    return true})
            }else{
                return false
            }
        })
    })
}

export function spawnPosts(userId, container, numberOfPosts){
    container.innerHTML = "" 
    let posts= getValueFromLocalStorage("posts")

    let endIndex = numberOfPosts*parseInt(localStorage.getItem("pageNumber"))
    let startIndex = endIndex-numberOfPosts
    if(endIndex > posts.length) {
        endIndex = posts.length
    }
    posts = posts.slice(startIndex, endIndex)

    for (const post of posts) {
        container.append(createPost(userId, post))
    }
}

export function createPost(id, post){
    const postCard = createEl("div", "", "post")

    if(id === post.authorId) spawnUpdateAndDeleteButtons(post.id, postCard)

    postCard.append(createEl("h2", post.title, "postTitle"))

    const postInfoContainer = createEl("div", "", "postInfoContainer")
    postInfoContainer.append(createInfoText("User", post.author))
    postInfoContainer.append(createInfoText("Date", post.date))
    postInfoContainer.append(createInfoText("ID", post.id))
    postCard.append(postInfoContainer)

    postCard.append(createEl("p", shortenDescription(post.description), "postDescription"))

    const postLink = createEl("a", "View full post ...", "postLink")
    postLink.href = "/post"
    postLink.setAttribute("data-link", "")
    postLink.addEventListener("click", () => {
        localStorage.setItem("articleID", post.id)
    })
    postCard.append(postLink)

    postCard.append(createStarButton(post))

    return postCard
}

export function getPost(){
    const post = getPostById(localStorage.getItem("articleID"))
    if(post === null) return ""
    return spawnPost(post)
}