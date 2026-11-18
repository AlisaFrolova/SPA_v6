import createAchievementsSection from "./Modules/achievementsModule.js"
import { createEl } from "../../tools/DOM_tools.js"
import { getUser, getMethod } from "../../tools/API_tools.js"

export default function homeView(){
    const app = document.querySelector('#app')

    //section
    const section = createEl("section", "", "mainSection")
    app.append(section)

    const headerContainer = createEl("h1", "", "headerContainer")

    headerContainer.append(createHeader("A", "STRA"))
    headerContainer.append(createHeader("S", "PECTRUM"))
    headerContainer.append(createHeader("A", "NALYTICS"))

    const backgroundVideo = createEl("video", "", "backgroundVideo")
    //backgroundVideo.setAttribute("autoplay", "")
    backgroundVideo.setAttribute("loop", "")
    backgroundVideo.setAttribute("disablepictureinpicture", "")
    backgroundVideo.muted = "muted"
        
    const videoSource = createEl("source", "", "source")
    videoSource.type = "video/mp4"
    //videoSource.src = "https://images-assets.nasa.gov/video/A Future in Orbit/A Future in Orbit~orig.mp4"
    backgroundVideo.append(videoSource)

    headerContainer.append(backgroundVideo)

    section.append(headerContainer)

    getMethod("/api/userId").then(userId => {
        if(!userId) return
        
        getUser(userId.id).then(res => {
            const messageBlock = createEl("div", "", "messageBlock")
            messageBlock.append(createEl("p", `Hello, ${res.username}`, "accent"))
            document.body.append(messageBlock)
            setTimeout(() => {messageBlock.remove()}, 2800) 
        })
               
    })

    section.append(createAchievementsSection())
    
    return section
}

function createHeader(firstLetter, text){
    const header = createEl("h2", text, "header")
    header.prepend(createEl("b", firstLetter, "headerLetter"))
    return header
}
