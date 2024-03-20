/** @format */

var CryptoJS = require('crypto-js');
const env = require('../env-loader');

exports.encrypt = async (data) => {
	return CryptoJS.AES.encrypt(data, env.ENC_SECRET).toString();
};

exports.decrypt = async (encrypted) => {
	let bytes = CryptoJS.AES.decrypt(encrypted, env.ENC_SECRET);
	return bytes.toString(CryptoJS.enc.Utf8);
};
