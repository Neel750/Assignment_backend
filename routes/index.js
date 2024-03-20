/** @format */
const router = require('express').Router();
const userRoutes = require('./user-routes');
const productRoutes = require('./product-routes');

router.use('/', userRoutes);
router.use('/products/', productRoutes);

module.exports = router;
