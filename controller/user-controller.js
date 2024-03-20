/** @format */

const userHelper = require('../helpers/user-helper');
const { handleError } = require('../utils/error-handler');

exports.login = async (req, res) => {
	try {
		let { email, password } = req.body;
		if (!email || !password) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: StatusCodes.BAD_REQUEST,
				message: 'email or password is missing in body',
			});
		}
		let result = await userHelper.login(email, password);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.createUser = async (req, res) => {
	try {
		let { email } = req.body;
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: StatusCodes.BAD_REQUEST,
				message: 'email is missing in body',
			});
		}

		if (!regex.test(email)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: StatusCodes.BAD_REQUEST,
				message: 'invalid email',
			});
		}

		let result = await userHelper.createUser({ ...req.body });
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.updateUser = async (req, res) => {
	try {
		let { email } = req.body;
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: StatusCodes.BAD_REQUEST,
				message: 'email is missing in body',
			});
		}

		if (!regex.test(email)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: StatusCodes.BAD_REQUEST,
				message: 'invalid email',
			});
		}
		delete req.body.email;
		let result = await userHelper.updateUser(email, req.body);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.getUsers = async (req, res) => {
	try {
		let result = await userHelper.getUsers();
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};
