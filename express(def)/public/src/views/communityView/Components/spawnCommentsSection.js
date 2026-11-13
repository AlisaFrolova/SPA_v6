import getPosts from "./getPosts.js"
import { getValueFromLocalStorage, getCurrentDay } from "../../../tools/DataTools.js"
import { createEl, createInputBlock } from "../../../tools/DOM_tools.js"
import { postMethod, getUserId, getUser } from "../../../tools/API_tools.js"

export default function spawnCommentsSection(){
    const commentsSection = createEl("section", "", "commentsSection")

    commentsSection.append(createEl("p", "Comments", "accent"))

    const commentsContainer = createEl("div", "", "commentsContainer")

    getUserId().then(id => {
        getUser(id).then(user => {
            const posts = getValueFromLocalStorage("posts")
            for (let el of posts) {
                if(parseInt(el.id) === parseInt(localStorage.getItem("articleID"))){
                    const index = posts.indexOf(el)
                    for (const comment of posts[index].comments) {
                        const newComment = createComment(comment)
                        if(comment.author === user.username || posts[index].author === user.username){
                            const deleteButton = createEl("button", "Delete", "button")
                            deleteButton.addEventListener("click", () => {
                                postMethod({commentID: comment.id, postID: posts[index].id}, "/api/deleteComment").then(res => {
                                    if(res){
                                        newComment.remove()
                                        getPosts()
                                    }
                                })
                            })
                            newComment.append(deleteButton)
                        }
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
            getUserId().then(id => {
                getUser(id).then(user => {
                    const comment = {
                        authorId: id,
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