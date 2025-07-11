const mongoose = require('mongoose');
const slugify = require('slugify');
const TourSchema = mongoose.Schema({

 name:{
    type:String,
    required:[true,"Name must be Provided"],
    validate:{
        validator: function(val){    
         const regex = /^[a-zA-Z\s]+$/;
         return regex.test(val);  
      },
        message:`${this.name} must contain only alphabets`
      },
      max: [20,"the name cannot exceed 20 chars"],
      min:[3,"the name should be more than 3 chars"],
      unique:true,
 },
 duration:{
    type:Number,
    required:[true,"Duration is missing"],

 },
 difficulty:{
    type:String,
    required:true,
    enum:{
     values: ['easy','medium','difficult'],
     message: "the difficulty should be either difficult or easy or hard",
   }
 },
 maxGroupSize:{
    type:Number,
    required:[true,"maxGroupSize is missing"],
 },
 ratingsAverage:{
    type:Number,
    required:true,
    min:[1,'ratings average cannot be less than 1.0'],
    max:[5,'ratings average cannot be more than 5.0'],
    set: val => Math.round(val*10) / 10     
 },
 ratingsQuantity:{
   type:Number,
   required:[true,"ratingsQuantity is missing"],
 },
 slug: String,
 price:{
   type:Number,
   required:[true,"price is missing"],   
 },
 summary:{
   type:String,
   required:[true,"summary is missing"],
 },
 description:{
  type:String
 },
 imageCover:{
   type:String,
   required:[true,"imageCover is missing"],
 },
 images:{
   type:[String] 
 },
 createdAt:{
   type:Date,
   default:Date.now()
 },
 startLocation:{
  // GeoJson, in order to specify geospatial data
  type: {
    type:String,
    default:'Point',
    enum:['Point']
  },
  coordinates:[Number],
  address:String,
  description:String,
},
startDates: [Date],
locations:[
{
  type: {
    type:String,
    default:'Point',
    enum:['Point']
  },
  coordinates:[Number],
  address:String,
  description:String,
  day:Number, 
}
],
// guides:Array,
guides:[
  {type:mongoose.Schema.ObjectId,
    ref: 'User',
  }
],

// reviews:[
//   {
//     type:mongoose.Schema.ObjectId,
//     ref:'Review',
//   }
// ]

},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
// creating indexes to make more effcient
// instead of scaning all the documenys scan lesser by indexing 
// wchic order the data if 1 ASC -1 DSC
// unique properties are indexes
// Single Field Index
// TourSchema.index({price:1});
// Compound Field Index
TourSchema.index({price:1,ratingsAverage:-1});
TourSchema.index({ slug: 1 });
TourSchema.index({startLocation:"2dsphere"});

// virtual Propety
TourSchema.virtual('durationWeeks').get(function(){
  return this.duration / 7;
})

TourSchema.pre('save',function(next){
 this.slug = slugify(this.name,{lower:true});
  next();
})

// Virtual Populate
TourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

// Embeding Guides

// TourSchema.pre('save', async function(next){
//   const guides = this.guides.map(async (id) => await User.findById(id));
//   console.log(guides);
//   this.guides = await Promise.all(guides);
//   next(); 
// })
// Correct middleware hooks
TourSchema.pre('save', function (next) {
  console.log('Will save the document'); // Will be executed
  next(); // Call next() to proceed
});

TourSchema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:"-__v -passwordChangedAt"
  })
  next();
})

TourSchema.post('save', function (doc, next) {
  console.log('Document saved'); // Will be executed after save
  next();
});
module.exports = mongoose.model('Tour',TourSchema);
