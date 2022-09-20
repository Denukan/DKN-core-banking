const express = require('express')
const router = express.Router()
const uuid = require('uuid')

const CoreID = require('./../models/CoreID')

const genId = uuid.v4() 

/**
 * @swagger
 * components:
 *  schemas:
 *    Authetication:
 *      type: object
 *      required:
 *        - login
 *        - register
 *        - CoreId
 *      properties:
 *        firstName:
 *          type: string
 *          description: first name of user
 *        lastName:
 *          type: string
 *          description: first name of user
 *        email:
 *          type: string
 *          description: first name of user
 *        password:
 *          type: string
 *          description: first name of user
 *      
 */
/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: login and registration
 */

/**
 * @swagger
 * /user/CoreID:
 *  get:
 *    summary: Generates Core Banking ID
 *    tags: [Authentication]
 *    responses: 
 *      200:
 *        description: CoreID generation
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '/components/schemas/Authetication'
 */


router.get('/CoreID', (req, res) => {
  DknID = new CoreID({
    DknID: genId,
    expiresAt: Date.now() +  3600000
  })

  DknID.save().then(result => {
    res.status(200).json({
      status: "success",
      message: "DKNID generated",
      data: DknID
    })
  })
  .catch(err => {
    res.json({
      status: "FAILED",
      message: "failed id generation"
    })
  })
})

/**
 * @swagger
 * /user/regsiter:
 *  post:
 *    summary: Register new Client user
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                description: first name of user
 *              lastName:
 *                type: string
 *                description: last name of user
 *              email:
 *                type: string
 *                description: email name of user
 *              password:
 *                type: string
 *                description: password name of user
 *    responses:
 *       200:
 *        description: Proceed to verify CoreID
 *        content:
 *          application/json:
 *            scheme:
 *              status success
 *      
 * 
 * 
 */

router.post('/register', (req, res) => {
  let {firstName, lastName, email, password, mobile, coreID} = req.body
  firstName = firstName.trim(),
  lastName = lastName.trim(),
  email = email.trim(),
  password = password.trim(),
  mobile = mobile.trim(),
  coreID = coreID.trim()

  if (firstName == "" || lastName == "" || password == "" || email == "" || mobile == "") {
    res.status(400).json({
      status: "FAILED",
      message: "Please fill out all fields"
    })
  } else if (!/^[a-zA-Z ]+$/.test(firstName)) {
    res.status(400).json({
      status: "FAILED",
      message: "Name must be alphabetic"
    })
  }else if (!/^[a-zA-Z ]+$/.test(lastName)) {
    res.status(400).json({
      status: "FAILED",
      message: "Name must be alphabetic"
    })
  }else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
    res.status(400).json({
      status: "FAILED",
      message: "Invalid email"
    })
  } else if (password.length < 8) {
    res.status(400).json ({
      status: "FAILED",
      message: "password is too short"
    })
  } else(
    User.find({email}).then(result => {
      if(result.length) {
        res.status(401).json({
          status: "FAILED",
          message: "User with email already exist"
        })
      }else {bcrypt.hash(password, 10, (err, hash) => {
        const newUser = new User ({
          firstName,
          lastName,
          email,
          password: hash,
          coreID,
          mobile,
        })

        newUser.save.then(result => {
          verifyCoreID()
          // res.status(200).json({
          //   status: "success",
          //   message: "signup successful",
          //   data: result
          // })
        })
        .catch(err => {
          res.json({
            status: "FAILED",
            message: "An error occured while saving user account"
          })
        })
      })
      .catch(err => { 
        res.status(500).json({
          status: "Failed",
          message: "An error occured while hashing the password "
        })
      })
    }
    })
  )
})

router.post("/verifyCoreID" , async (reg, res) => {
  try {
    let {userId, DknID} = req.body
    if (!userId || !DknID) {
      throw Error (
        "Enter CoreID and UserID"
      )
    }else{
      const CoreIDrecords = await CoreID.find({
        userId,
      })
      if (CoreIDrecords.length <= 0){
        throw new Error(
          "Account record does not exist"
        )
      } else {
        const { expiresAt } = CoreIDrecords[0]
        const DknId = CoreIDrecords[0].DknID

        if (expiresAt < Date.now()) {
          await CoreID.deleteMany({ userId })
          throw new Error("DknId already expired")
        } else if (!DknId) {
            throw new Error (
              "Invalid Code passed"
            )
        }else {
          await User.update({_id: userId}, { verified: true})
          res.status(200).json({
            status: "Verified",
            message: "user vetified succesfully"
          })
        }
      }
    }
  }
  catch(error){
    res.json({
      status: "Failed",
      message: error.message,
    })
  }
})

/**
 * @swagger
 * /user/login:
 *  post:
 *    summary: login Client user
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: email name of user
 *              password:
 *                type: string
 *                description: password name of user
 *    responses:
 *       200:
 *        description: login successful
 *        content:
 *          application/json:
 *            scheme:
 *              status success
 *      
 * 
 * 
 */

router.post('/signin', (req, res) => {
  let { email, password} = req.body
  email = email.trim(),
  password = password.trim()

  if (email == ""  || password == "") {
    res.status(400).json({
      status: "FAILED",
      message: "password or email incorrect"
    })
  } else {
    User.find({email})
    .then(data => {
      if (data.length) {
        const hash = data[0].password
        bcrypt.compare(password, hash, (err, result) => {
          if (result) {
            res.status(200).json({
              status: "success",
              message: "Signin successful",
              data: data
            })
          }else {
            res.status(400).json({
              status: "FAILED",
              message: "password incorrect"
            })
          }
        })
        .catch(err => {
          res.status(500).json({
            status: "FAILED",
            message: "An error occurred while comparing the password"
          })
        })
      } else {
        res.status(400).json({
          status: "FAILED",
          message: "password or email incorrect"
        })
      }
    })
    .catch(err => {
      // res.status(500).json({
      //   status: "FAILED",
      //   message: "An error occurred while checking for existing user"
      // })
    })
  }
})

module.exports = router

