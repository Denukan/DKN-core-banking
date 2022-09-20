const mongoose = require('mongoose')
const Schema = mongoose.Schema

const coreIDSchema = new Schema({
  DknID: String,
  expiresAt: Date
})

const CoreID = mongoose.model( 'CoreID', coreIDSchema)

module.exports = CoreID;