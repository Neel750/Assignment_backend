/** @format */
const { StatusCodes } = require('http-status-codes');

const productHelper = require('../helpers/product-helper');
const { handleError } = require('../utils/error-handler');

exports.createProduct = async (req, res) => {
	try {
		if (req.decoded) {
			req.body.sourceFrom = req.decoded.userid;
		}
		if (req.body.assigned === undefined) {
			if (req.decoded.role !== 'admin') {
				req.body.assigned = req.decoded.userid;
			} else {
				req.body.assigned = '';
			}
		}

		let result = await productHelper.createProduct({ ...req.body });
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.deleteProduct = async (req, res) => {
	if (req.params.productSKU === undefined || req.params.productSKU === null) {
		return { status: StatusCodes.NOT_FOUND, message: 'product sku is required' };
	}
	try {
		let result = await productHelper.deleteProduct(req.params.productSKU);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.updateProduct = async (req, res) => {
	if (req.params.productSKU === undefined || req.params.productSKU === null) {
		return { status: StatusCodes.NOT_FOUND, message: 'product sku is required' };
	}
	try {
		let result = await productHelper.updateProduct(req.params.productSKU, req.body);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.updateProductAssignment = async (req, res) => {
	try {
		if (req.params.productSKU === undefined || req.params.productSKU === null) {
			return { status: StatusCodes.NOT_FOUND, message: 'product sku is required' };
		}
		let result = await productHelper.updateProductAssignment(req.params.productSKU, req.body);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.getProducts = async (req, res) => {
	try {
		let result = await productHelper.getProductByUserId(req.decoded.userid, req.decoded.role);
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.searchProducts = async (req, res) => {
	try {
		const { sku = '', productName = '' } = req.query;
		if (sku === undefined && productName === undefined) {
		}
		let result = await productHelper.searchProduct(req.decoded.userid, sku, productName, req.decoded.role === 'admin');
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};

exports.filterProducts = async (req, res) => {
	try {
		const { source = '', category = '' } = req.query;
		let result = await productHelper.filterProduct(req.decoded.userid, source, category, req.decoded.role === 'admin');
		return res.status(result.status).json(result);
	} catch (error) {
		return handleError(req, res, error);
	}
};
