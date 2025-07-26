const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing  = require("../models/listing.js");

const MONGO_URL = 'mongodb://localhost:27017/wanderlust'

main().
then(() => console.log("Connected"))
.catch((err) => console.log(err));

async function main(){
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({...obj, owner: "687cec7981f43ba3b5f8401d"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};
initDB();