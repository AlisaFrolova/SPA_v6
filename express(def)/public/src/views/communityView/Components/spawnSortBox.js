import { createEl } from "../../../tools/DOM_tools.js"
import { getValueFromLocalStorage } from "../../../tools/DataTools.js"
import { getPosts, spawnPosts } from "../../../tools/PostTools/PostTools.js"
import { getMethod } from "../../../tools/API_tools.js"

export default function spawnSortBox(){
    const section = createEl("section", "", "sortContainer")

    section.append(createRangeInput("stars"))

    const submitButton = createEl("button", "Submit", "button")
    submitButton.addEventListener("click", () => {
        const stars = document.querySelector(".starsInput").value
        getPosts().then(() => {
            let posts = getValueFromLocalStorage("posts")
            
            posts = posts.filter(el => {return el.stars >= stars})
            
            const postsJSON = JSON.stringify(posts)
            localStorage.setItem("posts", postsJSON)
            
            getMethod("/api/userId").then(userId => {
                if(!userId) return
                spawnPosts(userId, document.querySelector(".postsContainer"), 5)
            })
        })
        
    })
    section.append(submitButton)

    return section
}

function findMinAndMax(type){
    const obj = {min: 0, max: 0}
    const posts = getValueFromLocalStorage("posts")
    let tempArr = []
    if(!posts) return {min: 0, max: 0}
    for (const post of posts) {
        tempArr.push(post[type])
    }
    obj["min"] = Math.min(...tempArr)
    obj["max"] = Math.max(...tempArr)
    return obj
}


function createRangeInput(type){
    const sortBlock = createEl("div", "", "sortBlock")

    const tempInput = createEl("input", "", `${type}Input`)
    tempInput.type = "range"
    tempInput.id = `${type}Input`
    tempInput.name = `${type}Input`

    const minAndMax = findMinAndMax(type)
    tempInput.value = minAndMax["min"]
    tempInput.min = minAndMax["min"]
    tempInput.max = minAndMax["max"]

    sortBlock.append(tempInput)

    const tempLabel = createEl("label", type, `${type}Label`)
    tempLabel.for = `${type}Input`
    sortBlock.append(tempLabel)

    const inputValue = createEl("p", tempInput.value, "accent")
    tempInput.addEventListener("input", () => {
        inputValue.textContent = tempInput.value
    })
    sortBlock.prepend(inputValue)

    return sortBlock
}