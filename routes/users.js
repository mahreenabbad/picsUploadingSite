const { name } = require('ejs')
const mongoose = require('mongoose')
const plm = require("passport-local-mongoose")

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/postingsite")

const userSchema =mongoose.Schema({
name:String,
username:String,
email:String,
password:String,
profileImage:String,
contact:Number,
facebookId:String,
boards:{
  type:Array,
  default:[]
},
posts:[
  {
    type: mongoose.Schema.Types.ObjectId,
    ref:'post'
  }
]
})
userSchema.plugin(plm)
module.exports =mongoose.model('user',userSchema)