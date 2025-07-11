const Tour = require('./../models/tour')
const User = require('./../models/user')
const asyncWrapper = require('./../middleware/asynWrapperMiddleware');
const AppError = require('../utilities/appError');
const { default: axios } = require('axios');
exports.getOverview=asyncWrapper(async(req,res,next)=>{
    // 1) Get Tour Data from Collection
    const tours = await Tour.find();
    // 2)Build Template
    // 3)Render that template using tour data from 1)
    
    res.status(200).render('overview',{
        title:"All Tours",
        tours
    });
}) 

exports.getTour = asyncWrapper(async(req,res,next)=>{
    // 1)get the data, for the requested tour
    const {slug} = req.params;
    const tour = await Tour.findOne({slug}).populate({
        path:'reviews',
        select:'review rating user'
    });

    if(!tour){
        return next(new AppError('There is no tour with this name',404));
    }
    // 2)Buuild Template

    // Render Template Using data from 1)
    res.status(200).render('tour',{
        title:`${tour.name} tour`,
        tour
    })
});

exports.getLoginForm = asyncWrapper(async(req,res,next)=>{


    res.status(200).render('login',{

    });
});

exports.getAccount= (req,res,next)=>{
    res.status(200).render('account',{
        title:"My Account",
    });
};

// for updaing user info by form
exports.submitUserDate= asyncWrapper(async(req,res,next)=>{
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(req.user._id,{
    name:req.body.name,
    email:req.body.email
  },{
    runValidators:true,
    new:true
  });
  return res.status(200).render('account',{
    title:"My Account",
    user:updatedUser
});
  
});

