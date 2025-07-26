const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middlewares.js");
const listingController = require("../controllers/listing.js");



const multer = require("multer");
const { storage } = require("../cloudConfig.js");
// const upload = multer({dest: 'uploads/'});
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index)) //index route
    .post(  
        isLoggedIn,  
        upload.single("listings[image]"),
        validateListing,
        wrapAsync(listingController.createListing)); //create route
    // .post( upload.single("listings[image]"), (req, res) => {
    //     res.send(req.file);
    // });
//search route
router.get("/search", listingController.getListing);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);
//we wrote new before bcoz router may think new as id if we write at last

//category route
router.get("/category/:category", listingController.getCategory);

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) //show route
    .put(  
        isLoggedIn, 
        isOwner, 
        upload.single("listings[image]"),
        validateListing, 
        wrapAsync(listingController.updateListing))  //update route
    .delete( 
        isLoggedIn, 
        isOwner, 
        wrapAsync(listingController.destroyListing)); //delete route


//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;