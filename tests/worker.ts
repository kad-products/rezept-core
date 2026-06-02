// Minimal worker entrypoint for integration tests.
// Tests import action/repository code directly — this stub is only needed
// so cloudflareTest has a valid worker to host the test execution environment.
export default {
	fetch(): Response {
		return new Response('test worker');
	},
};
