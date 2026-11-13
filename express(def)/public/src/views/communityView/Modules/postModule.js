import createInfoText from "../Components/createInfoText.js"
import createStarButton from "../Components/createStarButton.js"
import spawnUpdateAndDeleteButtons from "../Components/spawnUpdateAndDeleteButtons.js"
import spawnCommentsSection from "../Components/spawnCommentsSection.js"
import { createEl, createLink } from "../../../tools/DOM_tools.js"
import { getUserId } from "../../../tools/API_tools.js"
import { getValueFromLocalStorage } from "../../../tools/DataTools.js"

export default function getPost(){
    const post = getPostById(localStorage.getItem("articleID"))
    if(post === null) return ""
    return spawnPost(post)
}

function spawnPost(post){ 
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

function getPostById(id){
    for (const el of getValueFromLocalStorage("posts")) {
        if(el.id === id){
            return el
        }
    }
    return null
}