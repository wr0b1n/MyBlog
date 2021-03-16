//jshint esversion:6

const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const { result } = require("lodash");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// connect to database
mongoose.connect("mongodb+srv://admin-robin:" + encodeURIComponent("269Ps#Mq") + "@cluster0.ffgrq.mongodb.net/blogDB", { useNewUrlParser: true });

// schema for post
const postSchema = {
  title: String,
  content: String
};

// schema for user
const userSchema = {
  username: String,
  password: String,
}

// create model of schema
const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

var loginMessage = "";

// routes - GET
app.get("/", function (req, res) {

  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  });

});




app.post('/auth', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    User.findOne({ username: username, password: password }).then(result => {
      if (result) {
        req.session.loggedin = true;
        req.session.username = username;
        console.log("Logged in! (" + username + ", " + password + ")");
        res.redirect('admin');
        res.end();
      }
      else {
        loginMessage = "Falsche Zugangsdaten! Versuche es erneut."
        res.redirect('login');
        res.end();
      }
    });
  } else {
    res.send('Please enter Username and Password!');
    res.end();
  }
});




app.get("/admin", function (req, res) {
  if (req.session.loggedin) {
    console.log("Logged in as " + req.session.username)
    res.render("admin", {
      username: req.session.username
    });
  } else {
    loginMessage = "Bitte einloggen!"
    res.redirect("login");
  }
  res.end();
});

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
});


app.get("/login", function (req, res) {
  res.render("login", {
    message: loginMessage
  });
});

// dynamic parameter
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });
});


// routes - POST --> save post in database
app.post("/admin", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});





// start server
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started.");
});
