import { createEl, createInputBlock } from "../../DOM_tools.js"
import { postMethod, getMethod, getUser } from "../../API_tools.js"
import { getValueFromLocalStorage, getCurrentDay } from "../../DataTools.js"
import { getPosts } from "../PostTools.js"

export default function spawnCommentsSection(){
    const commentsSection = createEl("section", "", "commentsSection")

    commentsSection.append(createEl("p", "Comments", "accent"))

    const commentsContainer = createEl("div", "", "commentsContainer")

    getMethod("/api/userId").then(userId => {
        getUser(userId.id).then(user => {
            spawnComments(user, commentsContainer)

            const createButton = createEl("button", "Create", "button")
            createButton.addEventListener("click", () => {
            createButton.before(createInputBlock("comments", "Your opinion..."))
            const submitButton = createEl("button", "Submit", "button")
            submitButton.addEventListener("click", () => {
                const commentText = document.querySelector(".commentsInput").value
                const comment = {
                    authorId: userId.id,
                    author: user.username,
                    date: getCurrentDay(),
                    text: commentText,
                    postID: localStorage.getItem("articleID")
                }
                postMethod(comment, "/api/comment").then(res => {
                    const messageContainer = createEl("div", "", "messageContainer")
                    if(res){
                        document.querySelector(".commentsInput").value = ""
                        commentsContainer.append(createComment(comment))
                        spawnComments(user, commentsContainer)
                        messageContainer.append(createEl("p", "Comment was created", "messageText"))
                    }else{
                        messageContainer.append(createEl("p", "Comment was not created", "messageText"))
                    }
                    commentsContainer.prepend(messageContainer)
                    setTimeout(() => {messageContainer.remove()}, 5000)
                })
            })  
            createButton.after(submitButton)
            createButton.remove()
        })
        commentsSection.append(createButton)

        commentsSection.append(commentsContainer)

        document.querySelector(".postContainer").append(commentsSection)

        })     
    })
}

function spawnComments(user, container){
    getPosts().then(response => {
        if(!response) return
        container.innerHTML = ""
        const posts = getValueFromLocalStorage("posts")
        for (let el of posts) {
            if(parseInt(el.id) === parseInt(localStorage.getItem("articleID"))){
                const index = posts.indexOf(el)
                for (const comment of posts[index].comments) {
                    const newComment = createComment(comment)
                    getMethod("/api/isAdmin").then(res => {
                        if(comment.author === user.username ||
                            posts[index].author === user.username ||
                                res.isAdmin){
                            spawnDeleteButton(comment.id, posts[index].id, user.id, newComment)
                        }
                    })
                    container.append(newComment)
                }
            }
        }
    })
}

function spawnDeleteButton(commentId, postId, userId, comment){
    const deleteButton = createEl("button", "Delete", "button")
    deleteButton.addEventListener("click", () => {
        postMethod({commentID: commentId, postID: postId, id: userId}, "/api/deleteComment").then(res => {
            if(res){
                comment.remove()
            }
        })
    })
    comment.append(deleteButton)
}

function createComment(comment){
    const commentContainer = createEl("div", "", "comment")

    commentContainer.append(createEl("p", comment.author, "commentText"))
    commentContainer.append(createEl("p", comment.text, "commentMainText"))
    commentContainer.append(createEl("p", comment.date, "commentDate"))

    return commentContainer
}