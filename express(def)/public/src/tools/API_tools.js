import tokenData from "../tokenModule.js"
import {logout} from "./authTools.js"

export function postMethod(data, path){
    return tokenData.refreshAccessToken().then(() => {
        return fetch(path, {
            method: "POST",
            headers:{ "Content-Type": "application/json", 
                    "authorization": `Bearer ${tokenData.getAccessToken()}` },
            body: JSON.stringify(data)
        }).then(res => {
            if(res.status === 200){
                fetch("/write", { method: 'GET', headers: { 'Content-Type': 'application/json' }})
                return true
            }
            if(res.status === 401) {logout(); return false }
            if(res.status === 400 || res.status === 500 || res.status === 403) {
                console.log("blablabla")
            }
        })
    })
}

export function getMethod(path){
    return tokenData.refreshAccessToken().then(() => {
        return fetch(path, {   
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
             "authorization": `Bearer ${tokenData.getAccessToken()}` }
        }).then(res => {
            if(res.status === 200){
                return res.json().then(data => {
                    return data
                })
            }
            if(res.status === 401) {logout(); return false }
            if(res.status === 400 || res.status === 500 || res.status === 403) {
                console.log("blablabla")
            }
        })
    })
}

export function getUser(id){
    return tokenData.refreshAccessToken().then(() => {
        return fetch('/api/user', {   
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
             "authorization": `Bearer ${tokenData.getAccessToken()}` },
        body: JSON.stringify({id: id})
        }).then(response => {
            if(response.status === 200){
                return response.json().then(data => {
                    return data //object: username, id, posts
                })
            }else{
                return false
            }
        })
    })
}