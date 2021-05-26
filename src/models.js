const mongoose = require("mongoose");

//Schema for user registration
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

//Creating Collection
const Register = new mongoose.model("User", userSchema);

module.exports = Register;
