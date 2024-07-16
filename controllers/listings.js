const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  // console.log(req.user);
  // if (!req.isAuthenticated()) {
  //   // to check if user is logged if yes then listing is rendered or else no
  //   req.flash("error", "You must login to create listing!");
  //   return res.redirect("/login");
  // }
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for, does not exist.");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  console.log(response.body.features[0].geometry);
  res.redirect("/listings")

  // let listing = req.body.listing;
  let url = req.file.path; // for cloud image
  let filename = req.file.fileName;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // for creating new owner
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
  // console.log(listing);
};

module.exports.renderEditForm = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing");
  // }
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for, does not exist.");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  // originalImageUrl.replace("/upload","/upload/w_250")
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // let listing = await Listing.findById(id);
  // if (!listing.owner.equals(res.locals.currUser._id)) {
  //   req.flash("error", "You do not have permission to edit");
  //   return res.redirect(`/listings/${id}`);
  // } Used as middleware
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // to update the image from cloud
  if (typeof req.file !== "undefined") {
    // check if this file exists
    let url = req.file.path; // for cloud image
    let filename = req.file.fileName;
    listing.image = { url, filename };
    await listing.save();
  } else req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing has been Deleted!");
  res.redirect("/listings");
};
