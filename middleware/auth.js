/** @format */

const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const secretKey = require('../env-loader').SECRET;
const cryptojs = require('../utils/crypto');

exports.getJWTToken = async (userData) => {
	let data = await cryptojs.encrypt(JSON.stringify(userData));
	let token = jwt.sign({ data }, secretKey, { expiresIn: '24h' });
	return token;
};

exports.validateToken = async (req, res, next) => {
	try {
		let token = req.headers.authorization || '';
		token = token.split(' ')[1];
		if (!token) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: StatusCodes.UNAUTHORIZED,
				message: 'Token is missing',
			});
		}
		let decoded = await jwt.verify(token, secretKey);
		decoded = await cryptojs.decrypt(decoded.data);
		decoded = JSON.parse(decoded);
		req['decoded'] = decoded;

		if (req.body.email) {
			if (decoded.email !== req.body.email) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					status: StatusCodes.UNAUTHORIZED,
					message: 'Email and token are not matching',
				});
			}
		}
		next();
	} catch (error) {
		if (error.name == 'TokenExpiredError') {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: StatusCodes.UNAUTHORIZED,
				message: 'Token has expired',
			});
		}
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			status: StatusCodes.INTERNAL_SERVER_ERROR,
			message: 'Something went wrong',
		});
	}
};

exports.validateAdminToken = async (req, res, next) => {
	try {
		let token = req.headers.authorization || '';
		token = token.split(' ')[1];
		if (!token) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: StatusCodes.UNAUTHORIZED,
				message: 'Token is missing',
			});
		}
		let decoded = await jwt.verify(token, secretKey);
		decoded = await cryptojs.decrypt(decoded.data);
		decoded = JSON.parse(decoded);
		req['decoded'] = decoded;
		if (decoded.role !== 'admin') {
			return res.status(StatusCodes.FORBIDDEN).json({
				status: StatusCodes.FORBIDDEN,
				message: "You don't have sufficient permissions.",
			});
		}
		next();
	} catch (error) {
		if (error.name == 'TokenExpiredError') {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: StatusCodes.UNAUTHORIZED,
				message: 'Token has expired',
			});
		}
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			status: StatusCodes.INTERNAL_SERVER_ERROR,
			message: 'Something went wrong',
		});
	}
};
