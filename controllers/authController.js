const crypto = require("crypto");
const User = require("../models/user");
const asyncWrapper = require("../middleware/asynWrapperMiddleware");
const jwt = require("jsonwebtoken");
const AppError = require("../utilities/appError");
const Email = require("../utilities/email");

const singToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};
const createSendToken = (user, statusCode, res) => {
  const token = singToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //only with https shich secure and encrypted
    secure: true,
    //just receive it and store it and it back no other manupulations
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "development") {
    cookieOptions.secure = false;
  }
  user.password = undefined;
  //broswer sent all the cookies of the website when making request
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

module.exports.signUp = asyncWrapper(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
    // role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser,url).sendWelcome();
  createSendToken(newUser, 201, res);
});

module.exports.login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  //check if email and password exists
  if (!email || !password) {
    const message = "email or passowrd is missing";
    return next(new AppError(message, 404));
  }
  //check if email exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Icorrect email or password", 401));
  }
  //if everything ok send token to the client
  createSendToken(user, 200, res);
});

module.exports.protect = asyncWrapper(async (req, res, next) => {
  //1) Getting the token and checking if its thers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You aren't logged in. Please Login and try again", 401)
    );
  }

  //2) Verifying the token
  const decodedObject = jwt.verify(token, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  //3) Check if the user still exists
  const user = await User.findById(decodedObject.id);
  if (!user)
    return next(
      new AppError("the user belonging to this token doesn't longer exist", 401)
    );

  //4)check if the user changed password after token has been issued
  const isPasswordChanged = user.changePasswordAfter(decodedObject.iat);
  if (isPasswordChanged){
    return next(
      new AppError(
        "You changed the password loggin again. Please Login and try again",
        401
      )
    );
  }
  //5)grant access to protected route
  req.user = user;
  console.log(user);
  res.locals.user = user;
  next();
});

exports.logout = (req, res) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

// Only for rendered pages, no errors!
module.exports.isLoggedIn = async (req, res, next) => {
  //1) Getting the token and checking if its thers

  if (req.cookies.jwt) {
    try {
      // 1) verifying the token
      const decodedObject = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      //3) Check if the user still exists
      const user = await User.findById(decodedObject.id);
      if (!user) return next();

      //4)check if the user changed password after token has been issued
      const isPasswordChanged = user.changePasswordAfter(decodedObject.iat);
      if (isPasswordChanged) return next();
      //5)There is a Logged in User
      // it more like data sent any template can access it
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  return next();
};

module.exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

module.exports.forgotPassword = asyncWrapper(async (req, res, next) => {
  //1)Get User based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("There is no user with this email address. ", 404)
    );
  }
  //2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3)Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    
    await new Email(user,resetURL).sendPasswordRest();

    res.status(200).json({
      status: "Success",
      mesage: "Token sent to email",
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("there was an error sending email. try again later"),
      500
    );
  }
});

module.exports.resetPassword = asyncWrapper(async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(hashedToken);
  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log(user.);
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // 2) if token has not expired, and there is n user, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordRestToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) update changedPasswordAt property

  // 4) Log the user in,send JWT
  createSendToken(user, 200, res);
});

module.exports.updatePassword = asyncWrapper(async (req, res, next) => {
  // 1) Get User from collection
  const user = await User.findById(req.user._id).select("+password");

  // 2) Check if posted current password is correct
  const isCorrectPassword = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );
  if (!isCorrectPassword) {
    return next(new AppError("Your password is wrong", 401));
  }

  // 3) if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // user.findByID won't work as needed not gonna run the validators

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
