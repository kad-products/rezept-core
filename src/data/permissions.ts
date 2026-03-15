export default {
	apiKeys: {
		create: ['BASIC', 'ADMIN'],
		read: ['BASIC', 'ADMIN'],
		update: ['BASIC', 'ADMIN'],
		delete: ['BASIC', 'ADMIN'],
	},
	auth: {
		login: ['PUBLIC'],
		logout: ['ADMIN', 'BASIC'],
	},
	profile: {
		read: ['ADMIN', 'BASIC'],
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
