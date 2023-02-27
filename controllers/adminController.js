const User = require("../model/userModel");
const bycrpt = require('bcrypt');
const randomstring = require('randomstring');
const config = require("../config/config");
const nodemailer = require('nodemailer');




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
        html:'<p>hay '+name+',please click here to <a href="http://localhost:8080/admin/forget-password?token='+token+'">Reset</a> your password.</p>'
       
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





const loadLogin = async(req,res)=>{

    try {
        
       res.render('admin_login');


    } catch (error) {
        console.log(error.message);
        console.log("loginload error");
    }


}

const verifyLogin = async(req,res)=>{

    try {
        
        const email = req.body.email;
        const password = req.body.password;

       const adminData =  await User.findOne({email:email});

       if(adminData){

       const passwordMatch = await bycrpt.compare(password,adminData.password);
        if(passwordMatch){

            if(adminData.is_admin === 0){
                
                res.render('admin_login',{message:"You are not admin."})
            }
            else{

                req.session.user_id = adminData._id;
                res.redirect('/admin/home')
            }


        }
        else{
            res.render('admin_login',{message:"Email and password is incorrect."})

        }

       }
       else{

        res.render('admin_login',{message:"Email and password is incorrect."})

       }

    } catch (error) {
        console.log(error.message);
        console.log("admin verifylogin");
    }


}

const loadDashboard = async(req,res)=>{

    try {
        
        res.render('admin_home');


    } catch (error) {
        console.log(error.message);
        console.log("loadDashboard admin");
    }

}

const loadUser = async(req,res)=>{

    try {
        const  userData = await User.findOne({_id:req.session.user_id});
        res.render('user_managment',{admin:userData});

    } catch (error) {
        console.log(error.message);
        console.log("loadUser");
    }


}

const logout = async(req,res)=>{
    try {
        
        req.session.destroy();
        res.redirect('/admin')


    } 
    catch (error) {
        console.log(error.message);
        console.log("logout");
    }
}

const forgetLoad = async(req,res)=>{

    try {
        
        res.render("admin _forget")


    } catch (error) {
        console.log(error.message);
        console.log("forgetLoad");
    }
}

const forgetVerify = async(req,res)=>{

    try {
        
        const email = req.body.email;
         const userData =  await  User.findOne({email:email});

         if (userData) {
            
           if (userData.is_admin === 0) {
            res.render('admin _forget',{message:"Email is incorrect"});
           }else{
            const randomString = randomstring.generate();
            const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
            sentResetPassword(userData.name, userData.email, randomString);
            res.render('admin _forget',{message:" Check Your Mail to reset your password"})
        }

         } else {
            res.render('admin _forget',{message:"Email is incorrect"});
         }


    } catch (error) {
        console.log(error.message);
        console.log("forgetverify");
    }
}

const forgetPasswordLoad = async(req,res)=>{

    try {
        
        const token = req.query.token;

       const tokenData = await User.findOne({token:token});
       if (tokenData) {
        res.render('email-verified',{user_id:tokenData._id});

       } else {
        res.render('404')
       }


    } catch (error) {
        console.log(error.message);
        console.log("forgetPasswordLoad");
    }

}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUser,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad
}



