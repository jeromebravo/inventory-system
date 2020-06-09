const express  = require("express"),
      passport = require("passport"),
      User     = require("../models/owner"),
      router   = express.Router();

// HOMEPAGE
router.get("/", function(req, res) {
    res.redirect("/login");
});

// REGISTER
// SHOW SIGN UP FORM
router.get("/register", (req, res) => {
    res.render("auth/register");
});

// USER SIGN UP
router.post("/register", async (req, res) => {
    const userCount = await User.find({});

    if(userCount.length === 0) {
        User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
            if(err) {
                req.flash("error", "A user with the given username is already registered");
                return res.redirect("/register");
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/items");
            });
        });
    } else {
        req.flash("error", "Cannot create another account");
        res.redirect("/register");
    }
});

// LOGIN
// SHOW LOGIN FORM
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// USER LOGIN
router.post("/login", passport.authenticate("local", {
    successRedirect: "/items",
    failureRedirect: "/login"
}), (req, res) => {});

// LOGOUT
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "Logged out");
    res.redirect("/login");
})

module.exports = router;