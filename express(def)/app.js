const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUser, getPosts,
   addPost, deletePost, updatePost, starPost,
    getUser, deleteUser, updateUser, updatePass,
      addComment, getUsers, spawnUsers, deleteComment,
        isAdmin, updateRole, getUserByUsername, getUsersInfo,
          updateUsersPass} = require('./users');
const cookieParser = require("cookie-parser")
const fs = require('fs/promises');

const ACCESS_SECRET = 'mySecretWord1'
const ACCESS_EXPIRES = 60*15

const REFRESH_SECRET = 'mySecretWord2'
const REFRESH_EXPIRES = 60*60*24 //sec*min*hours

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())

app.use((req, res, next) => {
  console.log(`[${req.method}]: ${req.url}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server launched on http://localhost:${PORT}`);
});

//file work
async function readUsersFile() {
     try {
     const data = await fs.readFile(FILE_PATH, 'utf-8');
       return JSON.parse(data);
    } catch (error) {
       if (error.code === 'ENOENT') {
           return [];
         }
         throw error;
   }
}
app.get('/read', async (req, res) => {
     try {
      const users = await readUsersFile();
      const isSpawned = await spawnUsers(users)
      if(isSpawned) return res.status(200)
     } catch (error) {
       console.error(error);
     res.status(500).json({ error: 'Error while reading file' });
   }
});
app.get('/write', async (req, res) => {
   try {
    let users = await getUsers()
    console.log(users, " writing")
    await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');

    return res.status(201)
    } catch (error) {
       console.error(error);
       return res.status(500).json({ error: 'Ошибка при записи в файл' });
    }
});


//register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body
  if (await findUser(username))
    return res.status(400).json({ message: "User already exists" })
 
  if(isValidCredentials(username) && isValidCredentials(password)){
    await createUser(username, password)
    res.json({ message: "User registered" })
  }else return res.status(400).json({ message: "Invalid enter" })
})

function isValidCredentials(value){
  if(value.indexOf(" ") !== -1 || value.length < 5 || value.length > 12){
    return false
  }else return true
}



//login
app.post('/api/login', async (req, res) => { 
  const { username, password } = req.body
  const user = await findUser(username)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' })

  const id = user.id
 
  const accessToken = jwt.sign(
    { id: id },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  )
  const refreshToken = jwt.sign(
    { id: id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  )

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_EXPIRES*1000
  })
 
  return res.json({ accessToken })
})



//tokens
app.post('/api/clear', (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken) return res.status(401).json({message:"No refresh token"})
    res.clearCookie("refreshToken")
    res.end()
})

function authMiddleware(req, res, next) { 
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401).json({ message: "No access token" })
 
  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.status(400).json({message:"Invalid token"})
    req.user = user
    next()
  })
}

app.post("/api/refresh", (req,res) => { 
  const refreshToken = req.cookies.refreshToken

  if(!refreshToken) return res.status(401).json({message:"No refresh token"})
  
  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if(err) return res.status(403).json({message:"Invalid refresh token"})

    const newAccessToken = jwt.sign(
      { id: user.id },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    )
    return res.json({accessToken: newAccessToken})
  })
})

app.post("/api/isAuth", (req, res) => {
   const refreshToken = req.cookies.refreshToken
    if(!refreshToken) return res.status(401).json({message:"No refresh token"})
    
    jwt.verify(refreshToken, REFRESH_SECRET, (err) => {
    if(err) return res.status(403).json({message:"Invalid refresh token"})
      else return res.sendStatus(200)
    })
})



//admin
async function adminMiddleware(req,res,next){
  const isAdminReq = await isAdmin(req.user.id)
  if(!isAdminReq) return res.status(403).json({message:"Forbidden"})
  next()
}
app.get("/api/isAdmin", authMiddleware, async (req,res) =>{
  const check = await isAdmin(req.user.id)
  res.json({isAdmin: check})
})
app.get("/api/getUsers", authMiddleware, adminMiddleware, async(req,res) => {
  const users = await getUsersInfo()
  return res.status(200).json(users)
})
app.post("/api/updateUsersPass", authMiddleware, adminMiddleware, async(req,res) => {
  const {userId, newPass} = req.body
  if(!isValidCredentials(newPass)) return res.status(400).json({message: "Invalid password"})

  const isUpdated = await updateUsersPass(userId, req.user.id, newPass)
  if(isUpdated) return res.status(200).json({message: "Users password was updated"})
    else return res.status(400).json({message: "Users password was not updated"})
})//

async function validationMiddleware(req,res,next){
 const isAdminReq = await isAdmin(req.user.id)
  if(req.user.id !== req.body.id && !isAdminReq) {
    return res.status(403).json({message: "Forbidden"})
  }
  next()
}

//user
app.post("/api/user", authMiddleware, async (req, res) => {
  const user = await getUser(req.body.id) 
  if(!user) return res.status(401).json({message: "User was not found"})
  return res.status(200).json(user)
})

app.post("/api/userByUsername", authMiddleware, async(req,res)=>{
  const user = await getUserByUsername(req.body.username) 
  if(!user) return res.status(401).json({message: "User was not found"})
  return res.status(200).json(user)
})

app.get("/api/userId", authMiddleware, (req,res) => {
  res.json({ id: req.user.id })
})

app.post("/api/deleteUser", authMiddleware, validationMiddleware, async (req, res) => {
  const isDeleted = await deleteUser(req.body.id)
  if(!isDeleted) return res.status(500).json({message: "User was not deleted"})
  return res.status(200).json({message: "User was deleted"})
})

app.post("/api/updateUser", authMiddleware, validationMiddleware, async (req, res) => {
  const {id, newUsername, newBio} = req.body
  if(!isValidCredentials(newUsername) || !isValidData(newBio)) return res.status(400).json({message: "Invalid user data"})

  const isUpdated = await updateUser({id: id, newUsername: newUsername, newBio: newBio}) 
  if(isUpdated) return res.status(200).json({message: "User was updated"})
  else return res.status(500).json({message: "User was not updated"})
})

app.post("/api/updatePass", authMiddleware, validationMiddleware, async (req,res) => {
  const { id, password, newPassword } = req.body
  if(!isValidCredentials(newPassword)) return res.status(400).json({message: "Invalid password"})

  const user = await getUser(id)
  if (!user) return res.status(401).json({ message: "User not found" })
 
  const isUpdated = await updatePass(id, newPassword, password)
  if(isUpdated) return res.status(200).json({message: "Password was changed"})
    else return res.status(403).json({message: "Password was not changed"})
})




//community-page
function isValidData(data){
  if(data.length > 1 && data.length < 450) return true
  else return false
}

app.get("/api/posts", authMiddleware, async (req, res) => {
  const posts = await getPosts()
  if(!posts) return res.status(500).json({message:"no posts"}) //^^

  return res.json(posts)
})

app.post("/api/addPost", authMiddleware, async (req, res) => {
  const { authorId, title, description, date } = req.body
  if(!isValidData(title) || !isValidData(description)) return res.status(400).json({message: "Invalid data"})
  const isAdded = await addPost({authorId: authorId, title: title, description: description, date: date})
  if(isAdded) return res.status(200).json({message: "Post was added"})
    else return res.status(403).json({message: "Post was not added"})
})

app.post("/api/deletePost", authMiddleware, validationMiddleware, async (req,res) => {
  const {postID} = req.body
  await deletePost(postID)
  return res.status(200).json({message: "Post was deleted"})
})

app.post("/api/updatePost", authMiddleware, async (req,res) => {
  const { authorId, title, description, id } = req.body 
  if(!isValidData(title) || !isValidData(description)) return res.status(400).json({message: "Invalid data"})
  
  const isUpdated = await updatePost(title, description, authorId, id)//! add some validation
  if(isUpdated) return res.status(200).json({message: "Post was updated"})
    else return res.status(403).json({message: "Post was not updated"})
})

app.post("/api/starPost", authMiddleware, async (req,res) => {
  const { postID, id, stars} = req.body
  const isStarred = await starPost(postID, id, stars)
  if(isStarred) return res.status(200).json({message:"Post stars were updated"})
    else return res.status(403).json({message: "Post stars were not updated"})
})

app.post("/api/comment", authMiddleware, async(req,res) =>{
  const {postID, text, authorId, date} = req.body
  if(!isValidData(text)) return res.status(400).json({message: "Invalid data"})

  const isAdded = await addComment(postID, authorId, date, text)
  if(isAdded) return res.status(200).json({message: "Comment was added"})
    else return res.status(403).json({message: "Comment was not added"})
})

app.post("/api/deleteComment", authMiddleware, validationMiddleware, async  (req, res) => {
  const { commentID, postID } = req.body
  const isDeleted = await deleteComment(commentID, postID)
  if(isDeleted) return res.status(200).json({message: "Comment was deleted"})
  else return res.status(403).json({message:"Comment was not deleted"})
})