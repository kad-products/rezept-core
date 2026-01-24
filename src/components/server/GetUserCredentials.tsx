import { Suspense } from "react";
import { getCredentialsByUserId } from '@/repositories/credentials';
import UserCredentialsTable from '@/components/client/UserCredentialsTable';

export default async function GetUserCredentials({ userId }: { userId: string }) {

    const userCredentials = await getCredentialsByUserId(userId);

    // Only plain objects can be passed to Client Components from Server Components. Uint8Array objects are not supported.
    const clientComponentCredentials = userCredentials.map( credential => ({
        ...credential,
        credentialId: undefined,
        publicKey: undefined,
    }) );

    return (
        <Suspense fallback={<div>Loading credentials...</div>}>
            <UserCredentialsTable credentials={clientComponentCredentials} />
        </Suspense>
    );

}