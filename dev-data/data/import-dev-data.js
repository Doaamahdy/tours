require('dotenv').config({ path: "./../../.env" })
const fs = require('fs')
const mongoose = require('mongoose')
const Tour = require('./../../models/tour');
const Review = require('./../../models/review')
const User = require('./../../models/user');



console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected Successfuly to the database");
}).catch((err)=>{
    // console.log(err);
    console.log("error connecting to the database");
})



// READ JSON FILES
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`))


const importData = async ()=>{
    try{
      await Tour.create(tours);
      await Review.create(reviews);
      await User.create(users,{validateBeforeSave:false});
      console.log('data successfully created');
      
    }catch(err){
     console.log(err);
    }
    process.exit();
}
const deleteData = async()=>{
    try{
      await Tour.deleteMany();
      await Review.deleteMany();
      await User.deleteMany();
     console.log('data has been deleted successfully');
     
    }catch(err){
      console.log(err); 
    }
    process.exit();
}

if(process.argv[2] === "--import")
    importData();
if(process.argv[2]== '--delete')
    deleteData();

console.log(process.argv);