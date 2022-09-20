require('./config/db')
const express = require("express");
const swaggerUi = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
// const cors = require("cors");

const options = {
  definition: {
    openapi:  "3.0.0",
    info: {
      title: "DenukanCBA API",
      version: "1.0.0",
      description: "Core banking API endpoints"
    },
    servers: [
      {
        url: "http://localhost:5001"
      }
    ],
  },
  apis: ["./api/*.js"]
}


const specs = swaggerJsDoc(options)


const app = require('express')()

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

const port = 5001

const bodyParser = require('express').json
app.use(bodyParser())


app.use(express.json());
// app.use(cors());

const Userrouter = require('./api/User')

app.use('/user', Userrouter)

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})


