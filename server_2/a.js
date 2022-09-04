const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const router = require('../routes/user.router')
const uri = "mongodb+srv://Riddhiman:123@cluster0.gqyxkh7.mongodb.net/Mathongo?retryWrites=true&w=majority"
mongoose.connect(uri)
const app = express()
app.use(cors())
app.use(router)
module.exports = app