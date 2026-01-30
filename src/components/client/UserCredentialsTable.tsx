'use client';
import type { Credential } from '@/models/credentials';

type CredentialDisplay = Omit<Credential, 'publicKey' | 'credentialId'>;

type UserCredentialsTableProps = {
	credentials: CredentialDisplay[];
	loading?: boolean;
};

export default function UserCredentialsTable({
	credentials,
	loading = false,
}: UserCredentialsTableProps) {
	return (
		<>
			<div>
				<pre>{JSON.stringify({ credentials, loading }, null, 2)}</pre>
			</div>
		</>
	);
}
