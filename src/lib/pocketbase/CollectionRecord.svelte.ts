import { createSubscriber } from 'svelte/reactivity';
import { pb } from './pocketbase.svelte.js';
import type { RecordModel, RecordService } from 'pocketbase';

interface CollectionRecordOptions<T extends RecordModel> {
	name: string;
	recordId: string;

	onInit?: (collection: RecordService<T>) => Promise<T | undefined>;

	onUpdate?: (record: T) => Promise<T | undefined> | T | undefined;
	onCreate?: (record: T) => Promise<T | undefined> | T | undefined;
	onDelete?: (record: T) => void | Promise<void>;
}

export class CollectionRecord<T extends RecordModel> {
	private subscribe;
	private localRecord: T | undefined;
	public collection: RecordService<T>;

	//prettier-ignore
	/**
	 * Creates a new reactive collection.
	 *
	 * @param {CollectionSubscriberOptions<T>} options - The configuration options for the collection.
	 */
	constructor({ name, onUpdate, onDelete, onCreate, onInit, recordId}: CollectionRecordOptions<T>) {
		if (!name) throw new Error('Collection name is required');
		this.collection = pb.collection(name);

		this.subscribe = createSubscriber((update) => {
			let off: () => void;
			const register = async () => {
				try {

					if (onInit) {
                        this.localRecord = await onInit(this.collection); 
                        update()
                    }

					off = await this.collection.subscribe(recordId, async ({ action, record }) => {
						if (action === 'update') {

							const customUpdate = onUpdate ? await onUpdate(record as T) : undefined;
                            if(customUpdate) record = customUpdate;

							if (this.localRecord) Object.assign(this.localRecord, record);
						} else if (action === 'create') {
							const customCreate = onCreate ? await onCreate(record as T) : undefined;
                            if(customCreate) record = customCreate;
							this.localRecord = record as T;
						} else if (action === 'delete') {
							if (onDelete) await onDelete(record as T);
                            this.localRecord = undefined;
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
	 * Gets the record stored in the collection.
	 *
	 * @returns {T} The list of records.
	 */
	get record(): T | undefined {
		this.subscribe();
		return this.localRecord;
	}
}
