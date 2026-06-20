import type { User, Session } from '$lib/server/auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | undefined
			session: Session | undefined
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
