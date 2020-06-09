const express = require("express"),
      auth    = require("../middleware/auth"),
      Items   = require("../models/items"),
      Orders  = require("../models/orders");
      router  = express.Router();

// INDEX
router.get("/", auth.isLoggedIn, async function(req, res) {
    const items = await Items.find({});
    const categories = await Items.find({}).distinct("category");
    res.render("items/index", {items, categories});
});

// NEW
router.get("/new", auth.isLoggedIn, function(req, res) {
    res.render("items/new");
});

// CREATE
router.post("/", auth.isLoggedIn, async function(req, res) {
    const item = {
        brand: req.body.brand,
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        stocks: req.body.stocks,
        image: req.body.image,
        dateCreated: currentDate(),
        addStocks: [
            {
                dateCreated: currentDate(),
                quantity: req.body.stocks
            }
        ],
        keywords: [req.body.brand.toLowerCase(), req.body.name.toLowerCase(), req.body.category.toLowerCase()]
    };
    await Items.create(item);
    req.flash("success", "Successfuly added");
    res.redirect("/items");
});

// SHOW
router.get("/:id", auth.isLoggedIn, async function(req, res) {
    try {
        const item = await Items.findById(req.params.id);
        const orders = await Orders.find({"orders.item": req.params.id}).sort("-deliveredDate");
        const ordersArray = [];
        
        // GET MAX LENGTH
        let length = 20;
        if(orders.length < length) {
            length = orders.length;
        }

        // LOOP THROUGH ORDERS
        let i = 0;
        while(i < length) {
            let order = orders[i];

            // FIND ITEM IN ORDERS
            let foundItem = order.orders.find(x => x.item.equals(req.params.id));
            // PUSH DELIVERED DATE AND ORDER QUANTITY
            ordersArray.push({date: order.orderDate, quantity: foundItem.quantity});

            i++;
        }

        res.render("items/show", {item, orders: ordersArray});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// SHOW ADD STOCKS FORM
router.get("/:id/stocks", auth.isLoggedIn, async (req, res) => {
    try {
        const item = await Items.findById(req.params.id);

        res.render("items/stocks", {item});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// UPDATE STOCKS
router.put("/:id/stocks", auth.isLoggedIn, async (req, res) => {
    try {
        const item = await Items.findById(req.params.id);
        item.stocks += parseInt(req.body.stocks);
        item.addStocks.push({
            dateCreated: currentDate(),
            quantity: req.body.stocks
        });
        item.save();
        // await Items.findByIdAndUpdate(req.params.id, {$inc: {stocks: req.body.stocks}});

        req.flash("success", "Stocks added");
        res.redirect(`/items/${req.params.id}`);
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// EDIT
router.get("/:id/edit", auth.isLoggedIn, async function(req, res) {
    try {
        const item = await Items.findById(req.params.id);
        res.render("items/edit", {item});
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// UPDATE
router.put("/:id", auth.isLoggedIn, async function(req, res) {
    try {
        const item = {
            brand: req.body.brand,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image: req.body.image,
            keywords: [req.body.brand.toLowerCase(), req.body.name.toLowerCase(), req.body.category.toLowerCase()]
        };
        await Items.findByIdAndUpdate(req.params.id, item);
        req.flash("success", "Updated");
        res.redirect(`/items/${req.params.id}`);
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// DESTROY
router.delete("/:id", auth.isLoggedIn, async function(req, res) {
    try {
        await Items.findByIdAndRemove(req.params.id);
        req.flash("success", "Deleted");
        res.redirect("/items");
    } catch {
        req.flash("error", "Something went wrong");
        res.redirect("/items");
    }
});

// SEARCH ITEM
router.post("/search", auth.isLoggedIn, async function(req, res) {
    let items = await Items.find({keywords: req.body.search.toLowerCase()});
    res.render("items/index", {items});
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