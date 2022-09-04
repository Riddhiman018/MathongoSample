//register
//login
//OTP
//forgot pwd 
//nodemailer
const express = require('express')
const router = express.Router()
router.use(express.json())
const usrschema = require('../model/user.mongo')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: 'yorb999@gmail.com',
        pass: 'kqcybyqyvbyshysz'
    }
});
router.post('/register',async (req,res,next)=>{
    //use the email_id
    try {
        const usr = await usrschema.findOne({
            email_id:req.body.email_id
        })
        if(usr){
            res.status(404).send({
                Message:'User already exists'
            })
        }
        else{
            next()
        }
    } catch (error) {
        res.status(500).send({
            Message:error.message
        })
    }
},async (req,res)=>{
    try {
        const email = req.body.email_id
        const salt = await bcrypt.genSalt()
        const hashedpwd = await bcrypt.hash(req.body.password,salt)
        const usr = new usrschema({
            email_id:email,
            password:hashedpwd
        })
        const r = await usr.save()
        if(r){
            res.status(200).send({
                Message:'New User Created'
            })
        }
    } catch (error) {
        res.status(500).send({
            Message:`Unknown Error with Message : ${error.message}`
        })
    }
})

router.post('/login',async (req,res,next)=>{
    //get username
    try {
        const usr = await usrschema.findOne({
            email_id:req.body.email_id
        })
        if(usr){
            req.body.ur_pwd = usr.password
            req.body.ver_status = usr.EMAIL_VERIFIED
            next()
        }
        else{
            res.status(404).send({
                Message:'User Not Registered'
            })
        }
    } catch (error) {
        res.status(500).send({
            Message:`Unknown Error with Message : ${error.message}`
        })
    }
},async (req,res)=>{
    try{
        const result = await bcrypt.compare(req.body.password,req.body.ur_pwd)
        if(result){
            if(req.body.ver_status){
                res.status(200).send({
                    Message:'User verified'
                })

            }
            else{
                res.status(400).send({
                    Message:'Email Verification Pending'
                })
            }
        }
        else{
            res.status(404).send({
                Message:'User not allowed'
            })
        }
    }catch(error){
        res.status(500).send({
            Message:`Unknown error with Message : ${error.message}`
        })
    }
})
//verify email
router.post('/sendOtp',async (req,res)=>{
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`
    const msg = {
        to: `${req.body.email_id}`, 
        from: 'shubro17@outlook.com', 
        subject: 'OTP Verification',
        text: `OTP: ${otp}`,
        html: `<strong>Verification: ${otp}</strong>`,
      }
      usrschema.updateOne({
        email_id:req.body.email_id
      },{
        OTP:otp
      },function(error,result){
        if(error){
            res.status(500).send({
                Message:`error message : ${error.message}`
            })
        }
        else{
            transporter.sendMail(msg,function(error,result){
                if(error){
                    res.status(500).send({
                        Message:`Error message during otp sending : ${error.message}`
                    })
                }
                else{
                    res.status(200).send({
                        Message:`OTP Sent to ${req.body.email_id}`
                    })
                }
            })
        }
      })
})
router.post('/verifyOTP',async (req,res)=>{
    const usr = usrschema.findOne({
        email_id:req.body.email_id
    },function(error,result){
        if(error){
            res.status(500).send({
                Message:`Internal error : ${error.message}`
            })
        }
        else{
            if(result.OTP==req.body.OTP){
                usrschema.updateOne({
                    email_id:req.body.email_id
                },{
                    EMAIL_VERIFIED:true,
                    OTP:''
                },function(error,result){
                    if(error){
                        res.status(500).send({
                            Message:`Error Message : ${error.message}`
                        })
                    }
                    else{
                        res.status(200).send({
                            Message:'User Email Verified'
                        })
                    }
                })
            }
            else{
                res.status(400).send({
                    Message:'Incorrect OTP'
                })
            }
        }
    })
})
router.get('/userDetails',async (req,res)=>{
    usrschema.findOne({
        email_id:req.query.email_id
    },function(error,result){
        if(error){
            res.status(500).send({
                Message:`Error message : ${error.message}`
            })
        }
        else{
            result.password = ""
            res.status(200).send(result)
        }
    })
})
module.exports = router