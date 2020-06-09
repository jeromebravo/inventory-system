const express = require("express"),
      Orders  = require("../models/orders"),
      auth    = require("../middleware/auth"),
      router  = express.Router();

// INDEX
router.get("/", auth.isLoggedIn, async (req, res) => {
    const from = firstDay();
    const to = currentDate();
    const orders = await Orders.find({status: "Delivered", deliveredDate: {$gte: from, $lte: to}}).sort("-deliveredDate");

    res.render("sales/index", {from, to, orders});
});

// SHOW MORE ORDER INFO
router.get("/:id", auth.isLoggedIn, async (req, res) => {
    try {
        const orders = await Orders.findById(req.params.id).populate("customer").populate("orders.item");
        res.render("orders/show", {orders, customer: orders.customer, status: null, nextStep: null});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/sales");
    }
});

// GENERATE REPORT
router.post("/", auth.isLoggedIn, async(req, res) => {
    const from = req.body.from;
    const to = req.body.to;
    const orders = await Orders.find({status: "Delivered", deliveredDate: {$gte: from, $lte: to}}).sort("-deliveredDate");

    res.render("sales/index", {from, to, orders});
});

// GET CURRENT DATE
function currentDate() {
    const date = new Date();

    let month = date.getMonth() + 1;
    let day = date.getDate();
    const year = date.getFullYear();

    if(month.toString().length === 1) {
        month = `0${month}`;
    }

    if(day.toString().length === 1) {
        day = `0${day}`;
    }

    return `${year}-${month}-${day}`;

}

// GET THE FIRST DAY OF THIS MONTH
function firstDay() {
    const date = new Date();

    let month = date.getMonth() + 1;
    const year = date.getFullYear();

    if(month.toString().length === 1) {
        month = `0${month}`;
    }

    return `${year}-${month}-01`
}

module.exports = router;