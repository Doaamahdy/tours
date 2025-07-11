const mongoose = require('mongoose');
const Tour = require('./tour');
const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "You must provide review text"]
  },
  rating: {
    type: Number,
    max: [5, "Rating cannot be greater than 5"],
    min: [1, "Rating cannot be less than 1"],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, "Review must belong to a tour"]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, "Review must belong to a user"]
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// create compound index to make the unique togther which mean one user can only make one comment on a trip
ReviewSchema.index({tour:1,user:1},{unique:true});

//make two queries behind the scene before finding the reviews 
ReviewSchema.pre(/^find/,function(next){
this.populate({
  path:'user',
  select:'name photo'
})

  next();
})
// Aggregation Pipline
ReviewSchema.statics.calcAverageRatings = async function(tourId){
  const stats = await this.aggregate([
    {
      $match:{
        tour:tourId
      }
    },
    {
      $group:{
        // _id is the propery used to group by
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'},
      }
    }
  ])
  console.log("Heereeeeee the statttttts");
  console.log(stats);
  if(stats.length > 0){
    const updatedTour = await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:stats[0].nRating,
      ratingsAverage:stats[0].avgRating
    },{new:true})
    console.log("12jdfhdjgh74568");
    console.log(updatedTour);    
  }
  return stats;
}
ReviewSchema.post('save',function(){
 // this points to the current review document
  // this.constructor points to the model  
this.constructor.calcAverageRatings(this.tour);

})
ReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.currentDoc = await this.clone().findOne(); // Clone the query before executing it
  next();
});

// POST MIDDLEWARE
ReviewSchema.post(/^findOneAnd/, async function() {
  if (this.currentDoc) {
    await this.currentDoc.constructor.calcAverageRatings(this.currentDoc.tour);
  }
});
module.exports = mongoose.model('Review', ReviewSchema);
