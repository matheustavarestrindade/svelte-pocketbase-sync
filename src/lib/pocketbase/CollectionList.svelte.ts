import { createSubscriber } from 'svelte/reactivity';
import { pb } from './pocketbase.svelte.js';
import type { RecordModel, RecordService } from 'pocketbase';

interface CollectionOptions<T extends RecordModel> {
	name: string;
	// If the record is updated but not on the list, the record will be inserted on the list
	insertOnUpdate?: boolean;

	onInit?: (collection: RecordService<T>) => Promise<T[] | undefined>;

	onUpdate?: (record: T) => Promise<T | undefined> | T | undefined;
	onCreate?: (record: T) => Promise<T | undefined> | T | undefined;
	onDelete?: (record: T) => void | Promise<void>;
}

export class CollectionList<T extends RecordModel> {
	private subscribe;
	private localRecords: T[] = [];
	public collection: RecordService<T>;

	//prettier-ignore
	/**
	 * Creates a new reactive collection.
	 *
	 * @param {CollectionSubscriberOptions<T>} options - The configuration options for the collection.
	 */
	constructor({ name, onUpdate, onDelete, onCreate, onInit, insertOnUpdate }: CollectionOptions<T>) {
		if (!name) throw new Error('Collection name is required');
		this.collection = pb.collection(name);

		this.subscribe = createSubscriber((update) => {
			let off: () => void;
			const register = async () => {
				try {

					if (onInit) {
                        this.localRecords = await onInit(this.collection) || [];
                        update()
                    }

					off = await this.collection.subscribe('*', async ({ action, record }) => {
						if (action === 'update') {
							const localRecord = this.localRecords.find((r) => r.id === record.id);

							const customUpdate = onUpdate ? await onUpdate(record as T) : undefined;
                            if(customUpdate) record = customUpdate;

							if (localRecord) Object.assign(localRecord, record);
							else if (insertOnUpdate) this.localRecords.push(record as T);
						} else if (action === 'create') {
							const customCreate = onCreate ? await onCreate(record as T) : undefined;
                            if(customCreate) record = customCreate;

							this.localRecords.push(record as T);
						} else if (action === 'delete') {
							if (onDelete) await onDelete(record as T);

							this.localRecords = this.localRecords.filter((r) => r.id !== record.id);
						}
						update();
					});
				} catch (error) {
					console.error(`Error subscribing to collection: ${name}`, error);
				}
			};

			register();
			return () => off();
		});
	}

	/**
	 * Gets the records stored in the collection.
	 *
	 * @returns {T[]} The list of records.
	 */
	get records(): T[] {
		this.subscribe();
		return this.localRecords;
	}
}
