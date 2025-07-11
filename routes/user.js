const express = require('express');

const router = express.Router();
const factory = require('./../controllers/handlerFactory')

// images are not uploaded directly to our database
// we upload them to our file system and put 
// link of the images into the database
// Here we set the configurations of the upload

// upload.single - here we create the middleware - single means we just upload one single file
const{
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto
}= require('../controllers/user')

const {
  signUp,
  login,
  logout,
  resetPassword,
  forgotPassword,
  protect,
  updatePassword,
  restrictTo
} = require('../controllers/authController')

router
    .route('/signup')
    .post(signUp);
router
    .route('/login')
    .post(login);
router
    .route('/logout')
    .get(logout);
    
router
    .route('/forgotPassword')
    .post(forgotPassword);    
router
    .route('/resetPassword/:token')
    .patch(resetPassword);    

//Protect all the routes after this middleware 
router.use(protect);

// available to the current user logged in
router
    .route('/me')
    .get(getMe,getUser)

router
    .route('/updateMyPassword')
    .patch(updatePassword)

router  
    .route('/deleteMe')
    .delete(deleteMe);    
router
    .route('/updateMe')
    // photo is the name of the field in html form
    .patch(uploadUserPhoto,resizeUserPhoto,updateMe);    

// Should only be available to the adnibistrator
router.use(restrictTo('admin'));

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)    



module.exports = router;