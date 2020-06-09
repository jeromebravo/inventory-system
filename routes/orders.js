const express  = require("express"),
      auth     = require("../middleware/auth"),
      Orders   = require("../models/orders"),
      Customer = require("../models/customer"),
      Items    = require("../models/items"),
      router   = express.Router();

// ====================
// PENDING ORDERS
// ====================

// INDEX
router.get("/pending", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.find({status: "Pending"}).populate("customer");
    res.render("orders/index", {orders, status: "pending", title: "PENDING"});
});

// SHOW
router.get("/pending/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
        res.render("orders/show", {orders, customer: orders.customer, status: "pending", nextStep: "Pack"});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// PACK ORDER
router.post("/pending/:id", auth.isLoggedIn, async (req, res) => {
    try {
        await Orders.findByIdAndUpdate(req.params.id, {status: "Packed"});
        req.flash("success", "Packed order");
        res.redirect("/items");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ====================
// PACKED ORDERS
// ====================

// INDEX
router.get("/packed", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.find({status: "Packed"}).populate("customer");
    res.render("orders/index", {orders, status: "packed", title: "PACKED"});
});

// SHOW
router.get("/packed/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
        res.render("orders/show", {orders, customer: orders.customer, status: "packed", nextStep: "Deliver"});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// SHIP ORDER
router.post("/packed/:id", auth.isLoggedIn, async (req, res) => {
    try {
        await Orders.findByIdAndUpdate(req.params.id, {status: "Out for delivery"});
        req.flash("success", "Out for delivery");
        res.redirect("/items");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ====================
// OUT FOR DELIVERY
// ====================
// INDEX
router.get("/deliver", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.find({status: "Out for delivery"}).populate("customer");
    res.render("orders/index", {orders, status: "deliver", title: "OUT FOR DELIVERY"});
});

// SHOW
router.get("/deliver/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
        res.render("orders/show", {orders, customer: orders.customer, status: "deliver", nextStep: "Delivered"});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ORDER DELIVERED
router.post("/deliver/:id", auth.isLoggedIn, async (req, res) => {
    try {
        await Orders.findByIdAndUpdate(req.params.id, {status: "Delivered", deliveredDate: currentDate()});
        req.flash("success", "Order delivered");
        res.redirect("/items");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ====================
// DELIVERED ORDERS
// ====================
// INDEX
router.get("/delivered", auth.isLoggedIn, async (req, res) => {
    const orders = await Orders.find({status: "Delivered"}).populate("customer").sort("-orderDate").limit(20);
    res.render("orders/index", {orders, status: "delivered", title: "RECENT DELIVERED ORDERS"});
});

// SHOW
router.get("/delivered/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
        res.render("orders/show", {orders, customer: orders.customer, status: null, nextStep: null});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// ==================
// FUNCTIONS
// ==================

// GET CURRENT DATE
function currentDate() {
    const date = new Date();

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if(month.toString().length === 1) {
        month = `0${month}`;
    }

    if(day.toString().length === 1) {
        day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
}

module.exports = router;