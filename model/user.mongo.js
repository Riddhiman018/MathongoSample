const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    FNAME:{
        type:String
    },
    LNAME:{
        type:String
    },
    email_id:{
        type:String
    },
    password:{
        type:String
    },
    OTP:{
        type:String,
        default:""
    },
    EMAIL_VERIFIED:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model('user',userSchema)
