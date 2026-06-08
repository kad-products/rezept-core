'use client';
import { CopyIcon } from '@radix-ui/react-icons';
import type { ApiKeyDBRead, RzTableColumn } from '@/types';
import RzTable from '../RzTable';

export default function ApiKeysTable({ apiKeys }: { apiKeys: ApiKeyDBRead[] }): React.ReactNode {
	const apiColumns: RzTableColumn[] = [
		{ label: 'API Key', key: 'apiKey', render: (apiKey: string): string => apiKey.substring(0, 12) },
		{ label: 'Name', key: 'name' },
		{ label: 'Permissions', key: 'permissions' },
		{ label: 'Revoke At', key: 'revokeAt' },
		{ label: 'Created At', key: 'createdAt' },
		{
			label: 'Actions',
			key: 'actions',
			render: (_: string, apiKey: Record<string, unknown>) => (
				<button type="button" onClick={() => navigator.clipboard.writeText(String(apiKey.apiKey))}>
					<CopyIcon />
				</button>
			),
		},
	];

	return <RzTable columns={apiColumns} data={apiKeys} rowIndex="apiKey" />;
}
