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
	return <>{JSON.stringify({ credentials, loading })}</>;
}
