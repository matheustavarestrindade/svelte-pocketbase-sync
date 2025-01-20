import PocketBase from 'pocketbase';
import type { AuthRecord } from 'pocketbase';

/**
 * The PocketBase instance.
 * @type {PocketBase}
 * */
export const pb = new PocketBase(process.env.POCKETBASE_URL);

/**
 * The current authenticated user.
 * @type {AuthRecord}
 **/
export let user = $state<{ current: AuthRecord; logout: () => void }>({
	current: pb.authStore.record,
	logout: pb.authStore.clear
});

pb.authStore.onChange(() => {
	user.current = pb.authStore.record;
});
