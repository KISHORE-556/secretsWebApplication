
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose= require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: "wearedevelopers.",
    resave: false,
    saveUninitialized: true,
    
  }));

  app.use(passport.initialize());
  app.use(passport.session());
 
  
mongoose.connect("mongodb+srv://kishorethuta:XUZq9tEXngeJi98t@secretdb.0aqlgx7.mongodb.net/secretDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);



const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


passport.serializeUser(function(user, cb)

{ process.nextTick(function() {

    return cb(null, { id: user.id, username: user.username, picture: user.picture });

    });

});

passport.deserializeUser(function(user, cb) {

process.nextTick(function() {

return cb(null, user);

});

});


app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("Login");
})

app.get("/register",function(req,res){
    res.render("Register");
});

app.get("/secrets", function(req, res){
    User.find({"secret": { $ne: null }})
      .then((foundusers) => {
        if (foundusers) {
          res.render("secrets", { userswithsecret: foundusers });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
  
  app.post("/submit", function(req,res){
    const submittedSecret = req.body.secret;
    User.findById(req.user.id)
        .then(founduser => {
            if(founduser){
                founduser.secret = submittedSecret;
                return founduser.save();
            }
        })
        .then(() => {
            res.redirect("/secrets");
        })
        .catch(err => {
            console.log(err);
        });
});


app.get("/logout", function(req,res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
 });
});


app.get("/submit", function(req,res){

    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        
        res.redirect("/register");
    }

})


app.post("/register", function(req, res){
    
    User.register({username: req.body.username},req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res, function(){
                
                res.redirect("/secrets");
            })
        }
    })
   
    
});

app.post("/login", function(req,res){
    
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err){
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                })
            }
        })

})




app.listen(process.env.PORT  || 3000, function(){
    
})

