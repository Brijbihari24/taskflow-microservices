const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")

const app = express()
app.use(express.json())

const JWT_SECRET = "super-secret-key-change-later"

const users = []

app.post('/signup', async (req, res) => {
    const { username, password } = req.body

    // check if user already exist
    const existUser = users.find(u => u.username === username);
    if (existUser) {
        return res.status(400).json('User already exist!')
    }

    // hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
    }

    users.push(newUser);

    res.status(201).json({
        message: 'New User Created',
        userId: newUser.id,
        username,
    })

})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    //check user
    const user = users.find(u => u.username === username)
    if (!user) {
        return res.status(400).json({ message: "User not Found" })
    }

    //check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid Credentials: Check Password" })
    }

    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    )

    res.json({
        message: 'Login Successful',
        token
    })
})

app.post('/verify', async (req, res) => {
    const { token } = req.body

    //check for token
    if (!token) {
        return res.status(400).json({
            valid: false, message: "Token not Provided"
        })
    }

    // Verify token
    try {
        const decode = await jwt.verify(token, JWT_SECRET);
        res.status(201).json({ valid: true, message: "Valid Token", user: decode })
    } catch (err) {
        res.status(401).json({ valid: false, message: "Invalid or Expired Token" })
        console.log("error->", err);
    }
})

//verify token middleware
const verifyToken = async (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(400).json({ message: "Token not Provided" })
    }

    const token = authToken.split(' ')[1];

    try {
        const decoded = await jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        console.log('error ->', error);
        res.status(400).json('Invalid or Expire Token')
    }
}

app.get('/all-users', verifyToken, async (req, res) => {
    const allUsers = await users
    res.status(200).json({ message: "All Users", allUsers })
})

app.listen("3001", () => {
    console.log(`Auth Service is up and Running on PORT:${3001}`);

})

