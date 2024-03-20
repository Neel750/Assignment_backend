/** @format */
const { StatusCodes } = require('http-status-codes');

const db = require('../dbconnections/db');
const { getUserList, getUserListWithAdmin } = require('./user-helper');

const tableName = 'productData';

const checkSKUExists = async (sku) => {
	const params = {
		TableName: tableName,
		ProjectionExpression: 'SKU', // ProjectionExpression to only get the userId attribute
		FilterExpression: '#sku =:sku',
		ExpressionAttributeNames: {
			'#sku': 'SKU',
		},
		ExpressionAttributeValues: {
			':sku': sku,
		},
	};

	// Execute the query
	try {
		const data = await db.scan(params).promise();
		if (data.Items.length > 0) {
			return false;
		}
		return true;
	} catch (err) {
		console.error('Error JSON:', JSON.stringify(err, null, 2));
		return false;
	}
};

exports.createProduct = async (product) => {
	const params = {
		TableName: tableName,
		Item: product,
	};
	if (!(await checkSKUExists(product.SKU))) {
		return { status: StatusCodes.BAD_REQUEST, message: 'SKU already available' };
	}
	try {
		const result = await db.put(params).promise();
		console.log('Product created successfully');
		return { status: StatusCodes.OK, message: 'product created successfully' };
	} catch (error) {
		console.error('Error creating product:', error);
		throw error;
	}
};

exports.deleteProduct = async (sku) => {
	const params = {
		TableName: tableName,
		Key: {
			SKU: sku,
		},
	};

	try {
		await db.delete(params).promise();
		console.log('Product deleted successfully');
		return { status: StatusCodes.OK, message: 'product deleted successfully' };
	} catch (error) {
		console.error('Error deleting product:', error);
		throw error;
	}
};

exports.updateProduct = async (sku, updates) => {
	const params = {
		TableName: tableName,
		Key: {
			SKU: sku,
		},
		UpdateExpression: 'SET ',
		ExpressionAttributeValues: {},
		ReturnValues: 'UPDATED_NEW',
	};
	delete updates['canAssign'];
	Object.keys(updates).forEach((key) => {
		if (key === 'assigned') {
			params.UpdateExpression += `${key} = :${key}, `;
			params.ExpressionAttributeValues[`:${key}`] = updates[key][0]['userid'];
		} else if (key === 'sourceFrom') {
			params.UpdateExpression += `${key} = :${key}, `;
			params.ExpressionAttributeValues[`:${key}`] = updates[key][0]['userid'];
		} else {
			params.UpdateExpression += `${key} = :${key}, `;
			params.ExpressionAttributeValues[`:${key}`] = updates[key];
		}
	});

	params.UpdateExpression = params.UpdateExpression.slice(0, -2); // Remove trailing comma and space

	try {
		const data = await db.update(params).promise();
		console.log('Product updated successfully:', data);
		return { status: StatusCodes.OK, message: 'Data updated' };
	} catch (err) {
		console.error('Unable to update product. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};

exports.updateProductAssignment = async (sku, updates) => {
	const params = {
		TableName: tableName,
		Key: {
			SKU: sku,
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
		console.log('Product updated successfully:', data);
		return { status: StatusCodes.OK, message: 'Data updated' };
	} catch (err) {
		console.error('Unable to update product. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};

const removeUseridFromArray = (value, arr) => {
	return arr.filter((item) => item.userid != value);
};

const getUseridFromArray = (value, arr) => {
	return arr.filter((item) => item.userid == value);
};

exports.getProductByUserId = async (userId, role) => {
	const userIds = await getUserList();
	const userIdsWithAdmin = await getUserListWithAdmin();
	if (role === 'admin') {
		const params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: '#sourceFrom = :sourceValue',
			ExpressionAttributeNames: {
				'#sourceFrom': 'sourceFrom',
			},
			ExpressionAttributeValues: {
				':sourceValue': userId,
			},
		};

		try {
			const data = await db.scan(params).promise();
			let response = [];
			for (const item of data.Items) {
				let userList = removeUseridFromArray(item.assigned, userIds);
				let assignedUser = getUseridFromArray(item.assigned, userIds);
				let sourceUser = getUseridFromArray(item.sourceFrom, userIdsWithAdmin);
				response.push({ ...item, canAssign: userList, assigned: assignedUser, sourceFrom: sourceUser });
			}
			return { status: StatusCodes.OK, data: response };
		} catch (err) {
			console.error('Unable to get product by userid. Error JSON:', JSON.stringify(err, null, 2));
			throw err;
		}
	} else {
		const params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: 'assigned = :assign',
			ExpressionAttributeValues: {
				':assign': userId,
			},
		};

		try {
			const data = await db.scan(params).promise();
			let response = [];
			for (const item of data.Items) {
				let assignedUser = getUseridFromArray(item.assigned, userIds);
				let sourceUser = getUseridFromArray(item.sourceFrom, userIdsWithAdmin);
				response.push({ ...item, assigned: assignedUser, sourceFrom: sourceUser });
			}
			return { status: StatusCodes.OK, data: response };
		} catch (err) {
			console.error('Unable to get product by userid. Error JSON:', JSON.stringify(err, null, 2));
			throw err;
		}
	}
};

exports.searchProduct = async (userId, sku, productName, isAdmin) => {
	if (!isAdmin) {
		var params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: '(contains(#sku, :sku) OR contains(#productName, :productName)) AND contains(#assigned,:assign)',
			ExpressionAttributeNames: {
				'#assigned': 'assigned',
				'#productName': 'productName',
				'#sku': 'SKU',
			},
			ExpressionAttributeValues: {
				':sku': sku,
				':productName': productName,
				':assign': userId,
			},
		};
	} else {
		var params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: '(contains(#sku, :sku) OR contains(#productName, :productName)) AND contains(#sourceFrom,:source)',
			ExpressionAttributeNames: {
				'#sourceFrom': 'sourceFrom',
				'#productName': 'productName',
				'#sku': 'SKU',
			},
			ExpressionAttributeValues: {
				':sku': sku,
				':productName': productName,
				':source': 'admin',
			},
		};
	}
	try {
		const data = await db.scan(params).promise();
		return { status: StatusCodes.OK, data: data.Items };
	} catch (err) {
		console.error('Unable to get product by userid. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};

exports.filterProduct = async (userId, source, category, isAdmin) => {
	var filterExpression = '';
	if (source !== 'admin' && source !== '') {
		source = userId;
	}
	if (!isAdmin) {
		if (source && category) {
			filterExpression = '(contains(#sourceFrom, :source) AND #category = :category) AND #assigned = :assign';
		} else {
			filterExpression = '(contains(#sourceFrom, :source) OR #category = :category) AND #assigned = :assign';
		}
	} else {
		if (source && category) {
			filterExpression = '(contains(#sourceFrom, :source) AND #category = :category)';
		} else {
			filterExpression = '(contains(#sourceFrom, :source) OR #category = :category)';
		}
	}

	if (!isAdmin) {
		var params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: filterExpression,
			ExpressionAttributeNames: {
				'#sourceFrom': 'sourceFrom',
				'#category': 'category',
				'#assigned': 'assigned',
			},
			ExpressionAttributeValues: {
				':source': source,
				':category': category,
				':assign': userId,
			},
		};
	} else {
		var params = {
			TableName: tableName, // Replace 'your-table-name' with your DynamoDB table name
			FilterExpression: filterExpression,
			ExpressionAttributeNames: {
				'#sourceFrom': 'sourceFrom',
				'#category': 'category',
			},
			ExpressionAttributeValues: {
				':source': source,
				':category': category,
				':role': '1',
			},
		};
	}

	try {
		const data = await db.scan(params).promise();
		return { status: StatusCodes.OK, data: data.Items };
	} catch (err) {
		console.error('Unable to get product by source and category. Error JSON:', JSON.stringify(err, null, 2));
		throw err;
	}
};
