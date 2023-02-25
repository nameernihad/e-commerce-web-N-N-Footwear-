const User = require("../model/userModel");
const bycrpt = require('bcrypt');

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


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
}



