const mongoose = require('mongoose')
const Schema = mongoose.Schema

const registerSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  mobile: Number
})


const register = mongoose.model( 'register', registerSchema)

module.exports = register;
