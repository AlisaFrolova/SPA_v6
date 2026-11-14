const bcrypt = require('bcryptjs')

let users = []
let posts = []

async function spawnUsers(newUsers){
  users = structuredClone(newUsers)
  console.log(users, " read")
  return true
}
async function getUsers(){
  return users
}

//ID
function generateID(length, type){
  let id = ""
  for(let i = 0; i < length; i++){
    id = `${id}${Math.floor(Math.random() * 9)}`
  }
  if(isValidID(id, type)) return id
  else generateID(length, type)
}
function isValidID(id, type){
  let arr = []
  if(type === "users") arr = users
  if(type === "posts") arr = posts
  if(arr.findIndex(el => el.id === id) === -1) return true
  else return false
}

//validation tools
function getUserIndex(userValue, key){
  const userIndex = users.findIndex(user => user[key] === userValue)
  if(userIndex === -1) return false
  else return userIndex
}
 
//user --- Ready
async function createUser(username, password) {
  const hashed = await bcrypt.hash(password, 10)
  let id = generateID(8, "users")
  users.push({ username: username, id: id, password: hashed, bio: "No bio yet...",
     role:"user", starredPosts:[], posts: [] })
}
 
async function findUser(username) {
  return users.find(u => u.username === username);
}

async function deleteUser(id){
  const index = getUserIndex(id, "id")
  if(index === false) return false
  users.splice(index, 1)
  return true
}

async function updateUser(userData){
  const index = getUserIndex(userData.id, "id")
  if(index === false) return false
  
  const newIndex = getUserIndex(userData.newUsername, "username")
  if(newIndex !== false) return false

  console.log(" updateUser in users completed!")
  users[index].username = userData.newUsername
  if(userData.newBio === "") userData.newBio = "No bio yet..."
  users[index].bio = userData.newBio

  if(users[index].posts){
    for (const post of users[index].posts) {
      post.author = userData.newUsername
    }
  }

  return true
}

async function updatePass(id, newPassword, password){
  const index = getUserIndex(id, "id")
  if(index === false) return false

  const match = await bcrypt.compare(password, users[index].password);
  if (!match) return false

  const hashed = await bcrypt.hash(newPassword, 10)
  users[index].password = hashed
  return true
}

async function getUser(id){
  const index = getUserIndex(id, "id")
  if(index === false) return false

  const user = users[index]
  return createTempUser(user)
}

function createTempUser(user){
  const tempUser = {
    username: user.username,
    id: user.id,
    bio: user.bio,
    starredPosts: user.starredPosts,
    posts: user.posts
  }
  return tempUser
}

async function getUserByUsername(username){
  const index = getUserIndex(username, "username")
  if(index === false) return false

  const user = users[index]
  return createTempUser(user)
}

//community
async function getPosts(){
  posts = []
  for (const el of users) {
    for (const post of el.posts) {
      posts.push(post)
    }
  }
  return posts
}

async function addPost(post){
  const index = getUserIndex(post.authorId, "id")
  if(index === false) return false

  post["author"] = users[index].username
  post["id"] = generateID(6, "posts")
  post["stars"] = 0
  post["comments"] = []

  users.at(index).posts.push(post)
  return true
}

async function deletePost(postID){
  for (const user of users) {
    for (const post of user.posts) {
      if(parseInt(post.id) === parseInt(postID)){
        user.posts.splice(user.posts.indexOf(post), 1)
      }
    }
  }
}

async function updatePost(newTitle, newDescription, authorId, postID){
  const user = users.find(user => user.id === authorId)
  if(user){
    const index = user.posts.findIndex(post => parseInt(post.id) === parseInt(postID))
    if(index !== -1){
      user.posts[index].title = newTitle
      user.posts[index].description = newDescription
      return true
    }
  }
  return false
}

async function starPost(postID, userId, stars){
  const userIndex = getUserIndex(userId, "id")
  if(userIndex === false) return false

  const postIndex = posts.findIndex(post => post.id === postID)
  if(postIndex === -1) return false

  if(stars > posts[postIndex].stars){
    users[userIndex].starredPosts.push(postID)
  }else{
    const index = users[userIndex].starredPosts.indexOf(postID)
    users[userIndex].starredPosts.splice(index, 1)
  }
  posts[postIndex].stars = stars
  return true
}

async function addComment(postID, userId, date, commentText){
  const userIndex = getUserIndex(userId, "id")
  if(userIndex === false) return false

  let postIndex = posts.findIndex(post => post.id === postID)
  if(postIndex === -1) return false

  const comment = { author: users[userIndex].username, date: date, text: commentText, id: generateID(6, "posts")}
  
  const postAuthor = posts[postIndex].author

  const index = users.findIndex(user => user.username === postAuthor)
  if(index === -1) return false

  postIndex = users[index].posts.findIndex(post => post.id === postID)
  if(postIndex === -1) return false

  users[index].posts[postIndex].comments.push(comment)
  return true
}

async function deleteComment(commentID, postID){
  let postIndex = posts.findIndex(post => post.id === postID)
  if(postIndex === -1) return false

  const authorIndex = users.findIndex(user => user.username === posts[postIndex].author)
  if(authorIndex === -1) return false

  postIndex = users[authorIndex].posts.findIndex(post => post.id === postID)
  if(postIndex === -1) return false

  const commentIndex = users[authorIndex].posts[postIndex].comments.findIndex(comment => comment.id === commentID)
  if(commentIndex === -1) return false

  users[authorIndex].posts[postIndex].comments.splice(commentIndex, 1)

  return true
}

//admin --- Ready
async function isAdmin(id){
  const userIndex = getUserIndex(id, "id")
  if(userIndex === false) return false
  
  if(users[userIndex].role === "admin") return true
  else return false
}
async function updateRole(userID, adminID, newRole){
  const isAdmin = await isAdmin(adminID)
  if(!isAdmin) return false

  const userIndex = getUserIndex(userID, "id")
  if(userIndex === false) return false

  users[userIndex].role = newRole
  return true
}
async function getUsersInfo(){
  const tempUsers = []
  for (const user of users) {
    tempUsers.push({
      username: user.username,
      id: user.id,
      bio: user.bio,
      starredPosts: user.starredPosts,
      posts: user.posts
    })
  }
  return tempUsers
}

 
module.exports = { createUser, findUser, getPosts, 
   addPost, deletePost, updatePost, starPost,
    getUser, deleteUser, updateUser, updatePass, addComment,
      getUsers, spawnUsers, deleteComment, isAdmin,
        updateRole, getUserByUsername, getUsersInfo };