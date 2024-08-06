
const mongoose = require('mongoose')


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/postingsite")

const postSchema =mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'  // references to User collection (one to many relationship)
},
title:String,
description:String,
image:String,

})

module.exports =mongoose.model('post',postSchema)