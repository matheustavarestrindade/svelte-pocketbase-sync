<script lang="ts">
	import { CollectionList } from '$lib/pocketbase/CollectionList.svelte.js';
	import { CollectionRecord } from '$lib/pocketbase/CollectionRecord.svelte.js';
	import { pb, user } from '$lib/pocketbase/pocketbase.svelte.js';

	const test = new CollectionList({
		name: 'test',
		onInit: async (collection) => await collection.getFullList()
	});

	const record = new CollectionRecord({
		name: 'test',
		recordId: '119p42gj5817e6u',
		onInit: async (collection) => await collection.getOne('119p42gj5817e6u')
	});

	const login = async () => {
		const user = await pb.collection('users').authWithPassword('teste@hotmail.com', 'testtest123');
		console.log(user);
	};

	const testCreation = async () => {
		await pb.collection('test').create({ content: 'test ' + Math.random() });
	};

	const logout = async () => {
		user.logout();
	};
</script>

CurrentUser: {user.current?.id}
<hr />
<button onclick={login}> login </button>
<button onclick={logout}> logout </button>
<hr />
<button onclick={testCreation}> create test </button>
<hr />
Records:
<ol>
	{#each test.records as record}
		<li>
			{record.id}
		</li>
	{/each}
</ol>
<hr />
Record: 119p42gj5817e6u
<hr />
{record.record?.content}
