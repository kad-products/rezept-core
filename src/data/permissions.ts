export default {
	auth: {
		login: ['PUBLIC'],
		logout: ['ADMIN', 'BASIC'],
	},
	seasons: {
		create: ['ADMIN'],
		read: ['*'],
		update: ['ADMIN'],
		delete: ['ADMIN'],
	},
	recipes: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
		import: ['ADMIN', 'BASIC'],
	},
} as const;
