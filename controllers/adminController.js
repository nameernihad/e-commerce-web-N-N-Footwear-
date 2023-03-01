const User = require("../model/userModel");
const randomstring = require('randomstring');
const config = require("../config/config");
const nodemailer = require('nodemailer');
const bycrpt = require('bcrypt');

// password securing 
const securePassword = async(password)=>{

    try {
        
      const passwordHash = await bycrpt.hash(password, 10);
      return passwordHash;

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
                res.render('admin_home')
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
       
        const  userData = await User.find({is_admin:0});
        res.render('user_managment',{users:userData});

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
        res.render('forget-password',{user_id:tokenData._id});

       } else {
        res.render('404')
       }


    } catch (error) {
        console.log(error.message);
        console.log("forgetPasswordLoad");
    }

}

const resetPassword = async(req,res)=>{
    try {
        
        const password = req.body.password;
        const user_id =  req.body.user_id;
        console.log(password);
        const securepassword = await securePassword(password);
    const updatedData =  await User.findByIdAndUpdate({_id:user_id},{$set:{password:securepassword,token:''}})  

        res.redirect('/admin');
    } 
    catch (error) {
       console.log(error.message);
        console.log("resetpassword");
    }
}

const blockUser = async(req,res)=>{
    try {
        
        const id = req.query.id;
       const blockedUser = await User.updateOne({_id:user_id},{block:true});

    }
     catch (error) {
        console.log(error.message);
    }
}


const unblockUser = async(req,res)=>{
    const id = req.query.id;
    const blockedUser = await User.updateOne({_id:user_id},{block:false});
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUser,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    blockUser,
    unblockUser
}



