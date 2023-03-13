const is_Login = async(req,res,next)=>{
try {

    if(req.session.admin_id){ }
    else{
        res.redirect('/admin')
        return
    }

next()
} 
catch (error) {
    console.log(error.message);
}
}

const is_Logout = async(req,res,next)=>{
    try {
        
         if (req.session.admin_id) {
            
            res.redirect('/admin/home');
            return
         } 
         next()

    } 
    catch (error) {
        console.log("middle ware is login");
        console.log(error.message);
    }
}

module.exports = {
    is_Login,
    is_Logout
}