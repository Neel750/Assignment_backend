/** @format */

const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hashText = (text) => {
	const salt = bcrypt.genSaltSync(saltRounds);
	return bcrypt.hashSync(text, salt);
};

exports.compareHash = (encText, regText) => {
	return bcrypt.compareSync(regText, encText);
};
