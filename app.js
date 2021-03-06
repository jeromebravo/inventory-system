const express               = require("express"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      bodyParser            = require("body-parser"),
      flash                 = require("connect-flash"),
      session               = require("express-session"),
      methodOverride        = require("method-override"),
      User                  = require("./models/owner"),
      app                   = express();

const indexRoutes = require("./routes/index"),
      itemsRoutes = require("./routes/items"),
      orderRoutes = require("./routes/orders")
      salesRoutes = require("./routes/sales");

mongoose.connect("mongodb://localhost/battery_shop", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session(
    {
        secret: "woot",
        resave: false,
        saveUninitialized: false
    }
));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use("/items", itemsRoutes);
app.use("/orders", orderRoutes);
app.use("/sales", salesRoutes);

app.listen(3000, function(){
    console.log("Server has started!!!");
});