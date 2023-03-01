const isLogin = async(req,res,next)=>{
try {

    if(req.session.user_id){ }
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

const isLogout = async(req,res,next)=>{
    try {
        
         if (req.session.user_id) {
            
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
    isLogin,
    isLogout
}