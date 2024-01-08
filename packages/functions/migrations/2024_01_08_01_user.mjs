import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
	await db.schema
		.alterTable('users')
		.addColumn('lastLogin', 'timestamp')
		.addColumn('contactTel', 'text')
		.execute();

	await db.schema
	.createIndex('user_id_idx')
	.on('users')
	.column('id')
	.execute();
}


/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
	await db.schema
		.dropIndex('user_id_idx').execute()
}