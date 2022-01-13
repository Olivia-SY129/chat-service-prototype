const { MongoClient } = require('mongodb')
require('dotenv').config()

// Replace the following with your Atlas connection string
const uri = `mongodb+srv://1234:${process.env.MONGO_PASSWORD}@cluster0.qemkv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

module.exports = client
