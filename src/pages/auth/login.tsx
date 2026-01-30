import PasskeyLogin from '@/components/client/PasskeyLogin';
import PasskeyRegistration from '@/components/client/PasskeyRegistration';
import StandardLayout from '@/layouts/standard';
import type { AppContext } from '@/worker';

export default function Pages__auth__login({ ctx }: { ctx: AppContext }) {
	return (
		<StandardLayout currentBasePage="auth" pageTitle="Login" ctx={ctx}>
			{ctx.user ? (
				<div>
					<div>
						<h2>User</h2>
						<pre>{JSON.stringify(ctx.user, null, 4)}</pre>
					</div>
					<div>
						<h2>Session</h2>
						<pre>{JSON.stringify(ctx.session, null, 4)}</pre>
					</div>
				</div>
			) : (
				<>
					<PasskeyLogin />
					<PasskeyRegistration />
					<div>
						<pre>{JSON.stringify(ctx, null, 4)}</pre>
					</div>
				</>
			)}
		</StandardLayout>
	);
}
