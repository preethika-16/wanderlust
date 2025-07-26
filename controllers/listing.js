const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res, next) => {
    res.render("listings/new.ejs");
};

module.exports.showListing= async(req, res, next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    if(!listing){
        req.flash("error", "Listing Doesn't Exist!");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async(req, res, next) => {
    // let {title, description, image, price, location, country} = req.body;
    // if(!req.body.listings){
    //     throw new ExpressError(400, "Send Valid data for Listing")
    // }

    //map
    let response = await  geocodingClient.forwardGeocode({
    query: req.body.listings.location,
    limit: 1,
    })
    .send();
    console.log(response);
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listings);
    newListing.owner = req.user._id;

    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    // if(!newListing.description){
    //     throw new ExpressError(400, "Description is Missing")
    // }
    // if(!newListing.location){
    //     throw new ExpressError(400, "LOcation is Missing")
    // }
    // if(!newListing.title){
    //     throw new ExpressError(400, "Title is Missing")
    // }

    console.log(newListing);
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");   
};

module.exports.renderEditForm = async (req, res, next) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing Doesn't Exist!");
        return res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/h_250,w_250")
    res.render("listings/edit.ejs",{listing, originalImage});
};

module.exports.updateListing = async(req, res, next) => {
    // let {title, description, image, price, location, country} = req.body;
    // if(!req.body.listings){
    //     throw new ExpressError(400, "Send Valid data for Listing")
    // }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {... req.body.listings});
    if(typeof req.file !== "undefined"){ //bcoz if no file uploaded image will be empty in back end
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);//show route
};

module.exports.destroyListing = async(req, res, next) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect(`/listings`);
};

module.exports.getListing = async(req, res, next) => {
    try {
        const { q } = req.query;
        let allListings;

        if (!q || q.trim() === "") {
            allListings = await Listing.find({});
        } else {
            allListings = await Listing.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { location: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { country: { $regex: q, $options: 'i' } }
                ]
            });
        }
        res.render("listings/search.ejs", { allListings });
    } catch (err) {
        next(err);
    }
    // res.send("Searched");
};

module.exports.getCategory = async(req, res, next) => {
    try{
        const category = req.params.category;
        const listings = await Listing.find({category});
        res.render("listings/category.ejs", { listings, category });
    }catch(err){
        next(err);
    }

};