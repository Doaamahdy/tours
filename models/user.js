const crypto = require('crypto');
const mongoose = require('mongoose');
const validator =  require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name must be provided"]
    },
    email:{
       type:String,
       required:[true,"Email must be provided"],
       unique:[true,"email already exist"],
       lowercase:true,
       validate:[validator.isEmail,"Please Provide a valid email"]
    },
    role:{
     type:String,
     enum:{
      values: ['user','guide','lead-guide','admin'],
      message: "invalid role",
    },
     default:'user'
    },
    password:{
     type:String,
     required:[true,"Password must be provided"],
     minLength:8,
     select:false,
    },
    passwordConfirm:{
      type:String,
      required:[true,"PasswordConfirm must be provided"],
      validate:{
        validator:function(val){
            return val === this.password;
        },
        message:"confirmed password doesn't match password"
      }

    },
    photo:{
      type:String,
      default:'default.jpg'
    },
    passwordChangeAt:{
        type:Date,
    },
    passwordRestToken:{
      type:String,
    },
    passwordResetExpires:{
      type:Date,
    },
    active:{
      type:Boolean,
      default:true,
      select:false,
    }
})

UserSchema.pre(/^find/,function(next){
  // this points to the query
  this.find({active:{$ne:false}});
  next();
})


//works only on save and create
UserSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next();
  //bcrypt.hash() is a asynchrouns intesive cpu function
  //we can use the synchrounus version but it will block the event loop
  this.password = await bcrypt.hash(this.password,12);
  this.passwordConfirm = undefined;
  next();
})

UserSchema.pre('save',function(next){
  if(!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
})


//valid on all user documents
// Instance method to check if the password is correct
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    const isMatched = await bcrypt.compare(candidatePassword, userPassword);
    return isMatched;
};
//instance methods are avvailable on all the documents
//documents are instances
UserSchema.methods.changePasswordAfter = function(JWTTimestamp){
  console.log();  
  if(this.passwordChangeAt){
        const changedTimestamp = parseInt(
            this.passwordChangeAt.getTime()/1000,
            10
        );
        console.log(changedTimestamp,JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
  
    return false;
} 

UserSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordRestToken =crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

this.passwordResetExpires = Date.now() + (10*60*1000);
console.log({resetToken},{passwordRestToken:this.passwordRestToken});
return resetToken;
}
module.exports = mongoose.model('User',UserSchema);

