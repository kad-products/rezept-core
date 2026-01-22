import debug from "rwsdk/debug";
import { route } from "rwsdk/router";
import { Login } from "./pages/Login.js";

import { sessions } from "@/session/store";
const log = debug("passkey:routes");

export function authRoutes() {
  log("Setting up authentication routes");
  return [
    route("/login", Login),
    route("/logout", async function ({ request }) {

			const headers = new Headers();
			await sessions.remove(request, headers);
			headers.set("Location", "/");

			return new Response(null, {
				status: 302,
				headers,
			});

		}),
  ];
}
