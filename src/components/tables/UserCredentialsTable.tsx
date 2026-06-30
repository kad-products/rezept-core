import { RzTable } from '@/components/design-system';
import type { CredentialDBRead, Permission, RzTableColumn } from '@/types';

export default function UserCredentialsTable({
	credentials,
	userPermissions,
}: {
	credentials: CredentialDBRead[];
	userPermissions: Permission[];
}): React.ReactNode {
	// Only plain objects can be passed to Client Components from Server Components. Uint8Array objects are not supported.
	const clientComponentCredentials = credentials.map(credential => ({
		...credential,
		credentialId: undefined,
		publicKey: undefined,
	}));

	const userCredentialsColumns: RzTableColumn[] = [
		{ label: 'ID', key: 'id' },
		{ label: 'Name', key: 'name' },
		{ label: 'Counter', key: 'counter' },
		{ label: 'Created At', key: 'createdAt' },
	];

	return <RzTable userPermissions={userPermissions} columns={userCredentialsColumns} data={clientComponentCredentials} />;
}
