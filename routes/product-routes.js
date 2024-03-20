/** @format */

const router = require('express').Router();
const productController = require('../controller/product-controller');
const { validateAdminToken, validateToken } = require('../middleware/auth');

router.post('/', [validateToken], (req, res) => {
	return productController.createProduct(req, res);
});

router.get('/', [validateToken], (req, res) => {
	return productController.getProducts(req, res);
});

router.get('/search', [validateToken], (req, res) => {
	return productController.searchProducts(req, res);
});

router.get('/filter', [validateToken], (req, res) => {
	return productController.filterProducts(req, res);
});

router.delete('/:productSKU', [validateAdminToken], (req, res) => {
	return productController.deleteProduct(req, res);
});

router.put('/:productSKU', [validateAdminToken], (req, res) => {
	return productController.updateProduct(req, res);
});

router.put('/:productSKU/assign', [validateAdminToken], (req, res) => {
	return productController.updateProductAssignment(req, res);
});

module.exports = router;
