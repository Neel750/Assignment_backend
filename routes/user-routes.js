/** @format */

const router = require('express').Router();
const userController = require('../controller/user-controller');
const { validateAdminToken, validateToken } = require('../middleware/auth');

router.post('/login', (req, res) => {
	return userController.login(req, res);
});

router.post('/create-user', [validateAdminToken], (req, res) => {
	return userController.createUser(req, res);
});

router.put('/', [validateToken], (req, res) => {
	return userController.updateUser(req, res);
});

router.get('/users', [validateAdminToken], (req, res) => {
	return userController.getUsers(req, res);
});

module.exports = router;
