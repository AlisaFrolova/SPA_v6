import { getValueFromLocalStorage } from "../../DataTools.js"
import { createEl, createLink } from "../../DOM_tools.js"
import { postMethod, getUserId, getUser } from "../../API_tools.js"
import spawnCommentsSection from "./commentsSection.js"

export function createInfoText(key, value){
    const postInfoText = createEl("p", `${key}: `, "postInfoText")
    postInfoText.append(createEl("span", value, "innerText"))
    return postInfoText
}

export function createStarButton(post){
    const starButton = createEl("button", `✯${post.stars}`, "button")
    getUserId().then(id => {
        starButton.addEventListener("click", () => {
            if(starButton.classList.contains("starButton")){
                post.stars = parseInt(post.stars)-1
                starButton.classList.remove("starButton")
            }else {
                post.stars = parseInt(post.stars)+1
                starButton.classList.add("starButton")
            }
            starButton.textContent = `✯${post.stars}`
            postMethod({postID: post.id, id: id, stars: post.stars}, "/api/starPost").then(res => {
                if(res){
                    const posts = getValueFromLocalStorage("posts")
                    for (let el of posts) {
                        if(parseInt(el.id) === parseInt(post.id)){
                            const index = posts.indexOf(el)
                            posts[index].stars = parseInt(post.stars)
                        }
                    }
                    const postsJSON = JSON.stringify(posts)
                    localStorage.setItem("posts", postsJSON)
                    return true
                }else return false
            })
        })
        getUser(id).then(user => {
            if(user.starredPosts.indexOf(post.id) !== -1) {
                starButton.classList.add("starButton")
            }
        })
    })
    return starButton
}

export function spawnUpdateAndDeleteButtons(postID, postCard){
    postCard.append(createEl("p", "Your Post", "postMark"))
    
    const updateLink = createLink("Update", "/community/update")
    updateLink.addEventListener("click", () => {
        localStorage.setItem("articleID", postID)
    })
    postCard.append(updateLink)

    const deleteButton = createEl("button", "Delete", "button")
    getUserId().then(id => {
        deleteButton.addEventListener("click", () => {
            postMethod({postID: postID, id: id}, "/api/deletePost").then(res => {
                if(res){
                    postCard.remove()
                }else{
                    const message = createEl("p", "", "message")
                    message.textContent = "Post wasn't deleted, smth went wrong"
                    postCard.append(message)
                }
            })
        })
    })
    postCard.append(deleteButton)
}

export function spawnPost(post){ 
    const postCard = createEl("section", "", "fullPost")

    postCard.append(createEl("h2", post.title, "header"))

    getUserId().then(id => {
        const postContainer = createEl("div", "", "postContainer")
        if(id === post.authorId) spawnUpdateAndDeleteButtons(post.id, postContainer)

        const infoContainer = createEl("div", "", "postInfoContainer")
        infoContainer.append(createInfoText("User", post.author))
        infoContainer.append(createInfoText("Date", post.date))
        infoContainer.append(createInfoText("ID", post.id))
        postContainer.append(infoContainer)

        postContainer.append(createEl("p", post.description, "postDescription"))

        postContainer.append(createStarButton(post))

        postContainer.append(createLink("To Posts  -->", "/community"))

        postCard.append(postContainer)

        spawnCommentsSection()
    })
    return postCard
}

export function getPostById(id){
    for (const el of getValueFromLocalStorage("posts")) {
        if(el.id === id){
            return el
        }
    }
    return null
}