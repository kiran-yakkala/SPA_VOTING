const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const {connect} = require("mongoose")
require("dotenv").config()
const upload = require("express-fileupload")


const Routes = require("./routes/Routes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")


const app = express()
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials: true, origin:["http://localhost:3000","https://69cdd735a69a2af555e6f3b3--kiran-spavoting.netlify.app","https://kiran-spavoting.netlify.app"]}))
app.use(upload())

app.use('/api', Routes);

app.use(notFound)
app.use(errorHandler)


connect(process.env.MONGO_URL).then(app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`)
})).catch(err => console.log(err))

mongoose.connection.useDb('voting-app-tut')