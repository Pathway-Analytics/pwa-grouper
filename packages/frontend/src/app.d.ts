// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: SessionType;
			// user: UserType;
			page: PageData;
			// state: PageState;
			// platform: Platform;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

	}
}

export {};
