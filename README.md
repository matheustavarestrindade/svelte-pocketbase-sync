# Svelte PocketBase Reactive Wrapper

A reactive wrapper for PocketBase collections and records in SvelteKit, allowing automatic updates and reactivity.

## Installation

Ensure you have `pocketbase` installed:

```sh
npm install pocketbase
```

Then, add the wrapper files to your SvelteKit project.

---

## Usage

### 1. Initialize PocketBase

`pocketbase.svelte.ts` provides a reactive user store and PocketBase instance. The PocketBase URL should be set via an environment variable:

```ts
export const pb = new PocketBase(process.env.POCKETBASE_URL);
```

Additionally, `user.current` is a reactive store that holds the current authenticated user.

```ts
import { pb, user } from '$lib/pocketbase/pocketbase.svelte.js';
```

You can authenticate users:

```ts
const login = async () => {
	const auth = await pb.collection('users').authWithPassword('email@example.com', 'password');
	console.log(auth);
};

const logout = async () => {
	user.logout();
};
```

---

### 2. Working with Collections

#### Reactive List of Records

Use `CollectionList<T>` to track a collection reactively, where `T` is the type of the record.

```ts
import { CollectionList } from '$lib/pocketbase/CollectionList.svelte.js';

type TestRecord = { id: string; content: string };

const test = new CollectionList<TestRecord>({
	name: 'test',
	onInit: async (collection) => await collection.getFullList(),
	onUpdate: (record) => ({ ...record, updated: true }),
	onCreate: (record) => ({ ...record, new: true }),
	onDelete: (record) => console.log(`Record deleted: ${record.id}`)
});
```

- **onInit(collection)**: An optional function that runs when the collection is initialized. It should return a list of records.
- **onUpdate(record)**: Called when a record is updated. Can modify and return the updated record.
- **onCreate(record)**: Called when a new record is created. Can modify and return the newly created record.
- **onDelete(record)**: Called when a record is deleted. Can be used for cleanup actions.

Render in a Svelte component:

```svelte
<ul>
	{#each test.records as record}
		<li>{record.id}</li>
	{/each}
</ul>
```

#### Creating a New Record

```ts
const createTest = async () => {
	await pb.collection('test').create({ content: 'test ' + Math.random() });
};
```

---

### 3. Working with a Single Record

Use `CollectionRecord<T>` to track a single record reactively, where `T` is the type of the record.

```ts
import { CollectionRecord } from '$lib/pocketbase/CollectionRecord.svelte.js';

type TestRecord = { id: string; content: string };

const record = new CollectionRecord<TestRecord>({
	name: 'test',
	recordId: '119p42gj5817e6u',
	onInit: async (collection) => await collection.getOne('119p42gj5817e6u'),
	onUpdate: (record) => ({ ...record, modified: true }),
	onCreate: (record) => ({ ...record, initialized: true }),
	onDelete: (record) => console.log(`Record ${record.id} deleted`)
});
```

- **onInit(collection)**: Runs when the record is initialized. Should return the specific record.
- **onUpdate(record)**: Called when the record is updated. Can modify and return the updated record.
- **onCreate(record)**: Called when the record is created. Can modify and return the newly created record.
- **onDelete(record)**: Called when the record is deleted.

Render in a Svelte component:

```svelte
<p>Record Content: {record.record?.content}</p>
```

---

## Features

- 🔄 **Reactive Collections & Records**: Automatically update on changes.
- 🔑 **Authentication Handling**: Tracks authenticated users.
- 🔥 **Real-time Updates**: Uses PocketBase's subscription system.
- 🏗 **Lightweight & Modular**: Designed for SvelteKit applications.

---
