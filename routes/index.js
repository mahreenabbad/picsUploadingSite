var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
require('dotenv').config()
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');
const FacebookStrategy = require('passport-facebook').Strategy


passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
//facebook strategy


passport.use(new FacebookStrategy({
  clientID:process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  
},
function(accessToken, refreshToken, profile, cb) {
  userModel.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
router.get('/', function(req, res, next) {
  res.render('index',{nav: false});
});

router.get('/login', function(req, res, next) {
  res.redirect('/',{nav:false});
});
router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});
router.post('/register', function(req, res, next) {
 const data = new userModel({
  username: req.body.username,
  email: req.body.email,
  contact: req.body.contact,
  name: req.body.name
 })
 userModel.register(data, req.body.password)
 .then(function(){
  passport.authenticate('local')(req,res,function(){
    res.redirect('/profile')
  })
 })
});

router.get('/profile', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  .populate('posts')
  res.render('profile',{user, nav: true});
});
router.get('/show/posts', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  .populate('posts')
  res.render('show',{user, nav: true});
});

router.get('/feed', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
 const posts = await postModel.find()
             .populate('user')
  res.render('feed',{user, posts, nav: true});
});
router.get('/add', isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('add',{user, nav: true});
});
router.post('/createpost', isLoggedIn,upload.single('postimage'),async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
 const post = await postModel.create({
    user:user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.post('/fileupload',isLoggedIn,upload.single('image'), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
})

router.post('/login',passport.authenticate("local",{
  failureRedirect:'/',
  successRedirect:'/profile'
}), function(req, res, next) {
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated){
    return next();
  }
  res.redirect('/');
}


router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {  
    failureRedirect: '/failed',
   }),function(req, res){
    res.redirect('/profile')
   }

  );

  router.get('/failed', function(req, res, next){
    res.send('You are non Valid User');
  });

module.exports = router;
