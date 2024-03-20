/** @format */

const { StatusCodes } = require('http-status-codes');

exports.handleError = (req, res, error) => {
	console.log(error);
	res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		message: 'Something went wrong',
	});
};
