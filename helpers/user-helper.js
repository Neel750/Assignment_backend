/** @format */

const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const { getJWTToken } = require('../middleware/auth');
const { compareHash, hashText } = require('../utils/hash');
const db = require('../dbconnections/db');

const tableName = 'userData';

const getUser = async (emailData) => {
	const params = {
		TableName: tableName, // Replace 'Users' with your table name
		Key: {
			email: emailData,
		},
	};

	try {
		const data = await db.get(params).promise();
		return data.Item;
	} catch (err) {
		console.error('Unable to read user. Error JSON:', JSON.stringify(err, null, 2));
		return null;
	}
};

exports.createUser = async (user) => {
	const userData = {
		email: user.email,
		password: await hashText(user.password),
		fullname: user.fullname,
		role: user.role.toLowerCase() === 'admin' ? 1 : 0,
		userid: uuidv4(),
	};
	const params = {
		TableName: tableName,
		Item: userData,
	};

	try {
		await db.put(params).promise();
		console.log('User created successfully');
		return { status: StatusCodes.OK, message: 'user created successfully' };
	} catch (err) {
		console.error('Unable to create user. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};

exports.updateUser = async (email, updates) => {
	const params = {
		TableName: tableName,
		Key: {
			email: email,
		},
		UpdateExpression: 'SET ',
		ExpressionAttributeValues: {},
		ReturnValues: 'UPDATED_NEW',
	};

	Object.keys(updates).forEach((key) => {
		params.UpdateExpression += `${key} = :${key}, `;
		params.ExpressionAttributeValues[`:${key}`] = updates[key];
	});

	params.UpdateExpression = params.UpdateExpression.slice(0, -2); // Remove trailing comma and space

	try {
		const data = await db.update(params).promise();
		console.log('User updated successfully:', data);
		let users = await getUser(email);
		let user = { ...users, role: users.role == 1 ? 'admin' : 'user' };
		let token = await getJWTToken(user);
		delete user.password;
		return { status: StatusCodes.OK, message: 'Data updated', token: token, user: user };
	} catch (err) {
		console.error('Unable to update user. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};

exports.login = async (email, password) => {
	let users = await getUser(email);
	if (users === null || users === undefined) {
		return { status: StatusCodes.UNAUTHORIZED, message: 'Invalid credencials' };
	}
	const isValid = compareHash(users.password, password);
	if (!isValid) {
		return { status: StatusCodes.UNAUTHORIZED, message: 'Invalid credencials' };
	}

	let user = { ...users, role: users.role == 1 ? 'admin' : 'user' };
	let token = await getJWTToken(user);
	delete user.password;
	return { status: StatusCodes.OK, token: token, user: user };
};

exports.getUserList = async () => {
	const params = {
		TableName: tableName,
		ProjectionExpression: 'userid,fullname', // ProjectionExpression to only get the userId attribute
		FilterExpression: '#role <> :roleValue',
		ExpressionAttributeNames: {
			'#role': 'role',
		},
		ExpressionAttributeValues: {
			':roleValue': 1,
		},
	};

	// Execute the query
	try {
		const data = await db.scan(params).promise();
		const distinctUserIds = Array.from(new Set(data.Items.map((item) => ({ userid: item.userid, fullname: item.fullname })))); // Filter out duplicates
		return distinctUserIds;
	} catch (err) {
		console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
		return [];
	}
};

exports.getUserListWithAdmin = async () => {
	const params = {
		TableName: tableName,
		ProjectionExpression: 'userid,fullname', // ProjectionExpression to only get the userId attribute
	};

	// Execute the query
	try {
		const data = await db.scan(params).promise();
		const distinctUserIds = Array.from(new Set(data.Items.map((item) => ({ userid: item.userid, fullname: item.fullname })))); // Filter out duplicates
		return distinctUserIds;
	} catch (err) {
		console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
		return [];
	}
};

exports.getUsers = async () => {
	try {
		const data = await this.getUserList();
		return { status: StatusCodes.OK, data: data };
	} catch (err) {
		console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};
