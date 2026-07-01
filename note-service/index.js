const express = require('express')
const axios = require('axios')


const app = express()
const PORT = 3002;

app.use(express.json())

app.get('/healthy', async (req, res) => {
    console.log("Note Service is Healthy");
    res.send("Note Service is Healthy and Client")
})

const AUTH_SERVICE_URL = "http://localhost:3001"

//In memory note storage
const notes = []

//middleware to verify token
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader -> ", authHeader);


    //check authHeader
    if (!authHeader) {
        return res.status(400).json({ message: "Token not Provided" })
    }

    // to get exact token
    const token = authHeader.split(' ')[1]

    try {
        // calling Auth Service from Note Service 
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token })
        console.log("response -> ", response);


        if (response.data.valid) {
            req.user = response.data.user // attach user info in request
            next()
        } else {
            res.status(401).json({ message: "Invalid Token" })
        }

    } catch (error) {
        res.status(401).json({ message: "Token Verification Failed", error: error })
    }

}

app.post('/create-note', verifyToken, async (req, res) => {
    const { note_title, note_description } = req.body;

    const newNote = {
        id: notes.length + 1,
        note_title,
        note_description,
        userId: req.user.userId,
        username: req.user.username

    }

    notes.push(newNote)
    res.status(201).json({ message: "Successfully Note Added", newNote })
})

app.get('/all-notes', verifyToken, (req, res) => {
    const userNotes = notes.filter((note) => (note.userId === req.user.userId))
    res.json(userNotes)
})

app.listen(PORT, () => {
    console.log(`Note Service is up and Running on PORT: ${PORT}`);

})