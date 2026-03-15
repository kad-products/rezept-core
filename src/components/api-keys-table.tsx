'use client';
import { CopyIcon } from '@radix-ui/react-icons';
import type { ApiKey, RzTableColumn } from '@/types';
import RzTable from './rz-table';

export default function ApiKeysTable({ apiKeys }: { apiKeys: ApiKey[] }) {
	const apiColumns: RzTableColumn[] = [
		{ label: 'API Key', key: 'apiKey', render: apiKey => apiKey.substring(0, 12) },
		{ label: 'Name', key: 'name' },
		{ label: 'Permissions', key: 'permissions' },
		{ label: 'Revoke At', key: 'revokeAt' },
		{ label: 'Created At', key: 'createdAt' },
		{
			label: 'Actions',
			key: 'actions',
			render: (_, apiKey) => (
				<button type="button" onClick={() => navigator.clipboard.writeText(String(apiKey.apiKey))}>
					<CopyIcon />
				</button>
			),
		},
	];

	return <RzTable columns={apiColumns} data={apiKeys} />;
}
