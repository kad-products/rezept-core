'use client';
import { CopyIcon } from '@radix-ui/react-icons';
import { RzTable } from '@/components/design-system';
import type { ApiKeyDBRead, RzTableColumn } from '@/types';

export default function ApiKeysTable({ apiKeys }: { apiKeys: ApiKeyDBRead[] }): React.ReactNode {
	const clipboardCopy = async (_val: string, rec: Record<string, unknown>): Promise<void> => {
		await navigator.clipboard.writeText(String(rec.apiKey));
	};

	const apiColumns: RzTableColumn[] = [
		{ label: 'API Key', key: 'apiKey', render: (apiKey: string): string => apiKey.substring(0, 12) },
		{ label: 'Name', key: 'name' },
		{ label: 'Permissions', key: 'permissions' },
		{ label: 'Revoke At', key: 'revokeAt' },
		{ label: 'Created At', key: 'createdAt' },
		{
			label: 'Actions',
			key: 'actions',
			actions: [
				{
					type: 'button',
					handler: clipboardCopy,
					label: <CopyIcon />,
				},
			],
		},
	];

	return <RzTable columns={apiColumns} data={apiKeys} rowIndex="apiKey" />;
}
