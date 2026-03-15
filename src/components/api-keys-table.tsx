'use client';
import type { ApiKey, RzTableColumn } from '@/types';
import RzTable from './rz-table';

export default function ApiKeysTable({ apiKeys }: { apiKeys: ApiKey[] }) {
	const apiColumns: RzTableColumn[] = [
		{ label: 'API Key', key: 'apiKey', render: apiKey => apiKey.substring(0, 12) },
		{ label: 'Name', key: 'name' },
		{ label: 'Permissions', key: 'permissions' },
		{ label: 'Revoke At', key: 'revokeAt' },
		{ label: 'Created At', key: 'createdAt' },
	];

	return <RzTable columns={apiColumns} data={apiKeys} />;
}
