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
            const posts = getValueFromLocalStorage("posts")
            for (let el of posts) {
                if(parseInt(el.id) === parseInt(localStorage.getItem("articleID"))){
                    const index = posts.indexOf(el)
                    for (const comment of posts[index].comments) {
                        getMethod("/api/isAdmin").then(res => {
                            if(comment.author === user.username ||
                                posts[index].author === user.username ||
                                    res.isAdmin){
                                const deleteButton = createEl("button", "Delete", "button")
                                deleteButton.addEventListener("click", () => {
                                    postMethod({commentID: comment.id, postID: posts[index].id, id: user.id}, "/api/deleteComment").then(res => {
                                        if(res){
                                            newComment.remove()
                                            getPosts()
                                        }
                                    })
                                })
                                newComment.append(deleteButton)
                            }
                        })
                        const newComment = createComment(comment)
                        
                        commentsContainer.append(newComment)
                    }
                }
            }
        })
        
    })
    

    const createButton = createEl("button", "Create", "button")
    createButton.addEventListener("click", () => {
        createButton.before(createInputBlock("comments", "Your opinion..."))
        const submitButton = createEl("button", "Submit", "button")
        submitButton.addEventListener("click", () => {
            const commentText = document.querySelector(".commentsInput").value
            getMethod("/api/userId").then(userId => {
                getUser(userId.id).then(user => {
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

                            messageContainer.append(createEl("p", "Comment was created", "messageText"))

                            getPosts()
                        }else{
                            messageContainer.append(createEl("p", "Comment was not created", "messageText"))
                        }
                        commentsContainer.prepend(messageContainer)
                        setTimeout(() => {messageContainer.remove()}, 5000)
                    })
                })
                
            })
            
        })
        createButton.after(submitButton)
        createButton.remove()
    })
    commentsSection.append(createButton)

    commentsSection.append(commentsContainer)

    document.querySelector(".postContainer").append(commentsSection)
}

function createComment(comment){
    const commentContainer = createEl("div", "", "comment")

    commentContainer.append(createEl("p", comment.author, "commentText"))
    commentContainer.append(createEl("p", comment.text, "commentMainText"))
    commentContainer.append(createEl("p", comment.date, "commentDate"))
    
    return commentContainer
}