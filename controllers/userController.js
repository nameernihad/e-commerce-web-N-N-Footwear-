const User = require('../model/userModel');

const { unsubscribe } = require('../routes/userRoute');

const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');

const config = require('../config/config');

const Randormstring = require('Randomstring');
const { json } = require('body-parser');


const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
const client  = require('twilio')( TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})


// sent otp;







// password securing 
const securePassword = async(password)=>{

    try {
        
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}

// for sent mail
const sentVerifyMail = async( name, email , user_id)=>{

    try {
      const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:config.emailUser,
            pass:config.emailPassword
        }
       });
       const mailOption = {
         from:config.emailUser,
        to: email,
        subject:'For verification mail',
        html:'<p>hay '+name+',please click here to <a href="http://localhost:8080/verify?id='+user_id+'">verify</a> your mail.</p>'
       
       }
       transporter.sendMail(mailOption, function(error,info){
if (error) {
    console.log(error)
   

}
else{
    console.log("Email has been sent:- ",info.response);
}

       });
        
    } catch (error) {
        console.log(error.message);
    }



}



// for reset password sent mail


const sentResetPassword = async( name, email , token)=>{

    try {
      const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:config.emailUser,
            pass:config.emailPassword
        }
       });
       const mailOption = {
         from:config.emailUser,
        to: email,
        subject:'For Reset Password ',
        html:'<p>hay '+name+',please click here to <a href="http://localhost:3000/forget-password?token='+token+'">Reset</a> your password.</p>'
       
       }
       transporter.sendMail(mailOption, function(error,info){
if (error) {
    console.log(error.message);
    
   

}
else{
    console.log("Email has been sent:- ",info.response);
}

       });
        
    } catch (error) {
        console.log(error.message);
       
    }



}



const loadRegister = async(req,res)=>{
    try {
        res.render('registration');

        
    } catch (error) {
        console.log(error.message);
       
    }
}



const insertUser = async(req,res)=>{

    try{

        const spassword = await securePassword(req.body.password);
       
        const user = new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:spassword,
        is_admin:0
        })
        
                 const userData = await user.save();
                
        if(userData){
            
         sentVerifyMail(req.body.name, req.body.email, userData._id);
            

             res.render("registration",{message:"   Congratulations, Verifivation message is sended, please verify your email.."});
             message==null;
        }
        else {
       res.render("registration",{message:"Oops something wrong..."});
       message==null;
    }
        
        } catch (error){
        console.log(error.message);
    }
    
}

const VerifyMail = async(req, res)=>{
    try {
        
  const updateInfo = await User.updateOne({_id:req.query.id},{$set:{ is_verified:1 }});

  console.log(updateInfo);
  res.render("email-verified");

    } catch (error) {
        console.log(error.message);
       
    }
}



const phoneCheck = async(req,res)=>{
try {
    console.log('phonecheck');
    res.render('phoneNumber',{message:""}); 
    
}
 catch (error) {
    console.log(error.message);
    console.log("phonecheck error");
}

}


const sentOTP = async(req,res,next) =>{
   console.log("otp sent");

try {
    console.log('setotp');
    const num =  req.body.phone;
   
    const check = await User.findOne({phone:num })
    
    if(check){
        console.log("checkotp");
    const otpResponse  = await client.verify.
        v2.services(TWILIO_SERVICE_SID)
        .verifications.create({
            to: num,
            channel:"sms",
        });
        console.log("otp sented");
        res.render('otp',{message:num});
    
    }
    else{
        res.render('phoneNumber',{message:'This Number Is Not Registerd'})
    }
} catch (error) {
   console.log(error.message);
   console.log("sentOTP error");

}

};


const verifyOTP = async(req,res,next)=>{
   
    try {
        console.log("otp verification");
        const num = req.body.phone;
        const otp = req.body.otp;
        console.log(otp+""+num);
        const verifiedResponse = await client.verify.
        v2.services(TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to:num,
            code: otp,
        });
        if (verifiedResponse.status=='approved') {
            const userDetails = User.findOne({phone:phoneNumber})
            req.session.user_id = userDetails._id
            res.redirect('user_home');
            console.log("otp goted");
            
        } else {
            res.remder('otp',{message:"incorrect otp"});
            console.log("otp false");
        }

    } 
    catch (error) {
      console.log(error.message);
    }
}






// login user login method started

const loginload = async(req,res)=>{
    try {
        res.render('user_login')

    } catch (error) {
        console.log(error.message);
    }



}

const verifyLogin = async(req,res)=>{
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if (userData) {

            const passwordMatch =  await  bcrypt.compare(password,userData.password);
        if(passwordMatch){


    if(userData.is_verified === 0){

          res.render('user_login',{message:"Please verify your mail." })
          message==null;
        }
        else{
            req.session.user_id = userData._id;
          res.redirect('/home');
        }

             
        }
        else{
             res.render('user_login',{message:"Your Email or password is not valid"})
             message==null;
        }
        
    }else{

            res.render('user_login',{message:"Your Email and Password are incorrect"});
            message==null;
        }


    } catch (error) {
        console.log(error.message);
       
        
    }
}

const loadHome = async(req,res)=>{

      try {
        
     res.render('user_home');
      
    } 
      catch (error) {
        console.log(error.message);
        
      }


}

const userLogout = async(req,res)=>{

    try {
        
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }



}


// forget password code

const forgetLoad = async(req,res)=>{

    try {
        
        res.render('forget');


    }
     catch (error) {
        console.log(error.message);
    }

}

const forgetverify = async(req,res)=>{

    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email});

        if(userData){
            
          
            if (userData.is_verified === 0){
               
                res.render('forget',{message:"Please Verify Your Mail."})
                message==null;


            }
            else{
               const Randomstring  = Randormstring.generate();
               const updatedData =await User.updateOne({email:email},{$set:{token:Randomstring}})
               sentResetPassword(userData.name,userData.email,Randomstring );
                
               res.render('forget',{message:"Please Check Your Mail Reset Your Password ."})
               message==null;
            
            }

        }else{
            res.render('forget',{message:"Email Is Not Exist"})
            message==null;
        }

        
    } catch (error) {
        console.log(error.message);
        
    }



}

const forgetPasswordLoad = async(req,res)=>{

    try {
        
        const token = req.query.token;
       const tokenData = await User.findOne({token:token})

       if (tokenData) {
        res.render('forget-password',{user_id:tokenData._id});
       }
        else {
        res.render('404',{message:"Token is invalid"});
        message==null;
       }

    } catch (error) {
        console.log(error.message);
       
    }




}



const resetPassword = async(req,res)=>{
    
    try {
        
       const password = req.body.password;
       const user_id = req.body.user_id;

        const secure_password = await securePassword(password);

    
       const updatedData  = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password, token:''}})

        res.redirect("/")

       
    }
     catch (error) {
        console.log(error.meesage);
        
    }

}

// for verification sent
const verificationLoad = async(req,res)=>{
    
    try {
        
        res.render('user_verification');



    } catch (error) {
        console.log(error.message);
    }


}

const sendVerification = async(req,res)=>{

    try {
        
        const email =  req.body.email;
        
       const userData =  await User.findOne({email:email});

       if (userData) {
        
        sentVerifyMail(userData.name,userData.email,userData.user_id);

        res.render('user_verification',{message:"Reset verification mail sent your mail id ,please check "})
        message==null;

       } else {
        
        res.render('user_verification',{message:"This Email Is Not Exist."})
        message==null;

       }




    } catch (error) {
        console.log(error.message);
       
    }


}


module.exports = {
    loadRegister,
    insertUser,
    VerifyMail,
    sentOTP,
    verifyOTP ,
    loginload,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetverify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerification,
    phoneCheck ,

}