import tokenData from "../tokenModule.js"
import {logout} from "./authTools.js"

export function postMethod(data, path, isRefreshed = false){
        return fetch(path, {
            method: "POST",
            headers:{ "Content-Type": "application/json", 
                    "authorization": `Bearer ${tokenData.getAccessToken()}` },
            body: JSON.stringify(data)
        }).then(res => {
            if(res.status === 200){
                fetch("/write", { method: 'GET', headers: { 'Content-Type': 'application/json' }})
                return true
            }else{
                return checkToken(isRefreshed, () => {return postMethod(data, path, true)})
            }
        })
}
export function checkToken(status, func){
    if(status){
        logout()
        return false
    }else {
        return tokenData.refreshAccessToken().then(() => {
            return func()
        })
    }
}
export function getMethod(path, isRefreshed = false){
        return fetch(path, {   
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
             "authorization": `Bearer ${tokenData.getAccessToken()}` }
        }).then(res => {
            if(res.status === 200){
                return res.json().then(data => {
                    return data
                })
            }else{
                return checkToken(isRefreshed, () => {return getMethod(path, true)})
            }
        })
}

export function getUser(id, isRefreshed = false){
        return fetch('/api/user', {   
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
             "authorization": `Bearer ${tokenData.getAccessToken()}` },
        body: JSON.stringify({id: id})
        }).then(response => {
            if(response.status === 200){
                return response.json().then(data => {
                    return data
                })
            }else{
                return checkToken(isRefreshed, () => {return getUser(id, true)})
            }
        })
}