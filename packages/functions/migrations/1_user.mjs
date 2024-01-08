import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
	await db.schema
		.createTable('users')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('email', 'text', (col) => col.notNull())
		.addColumn('picture', 'text')
		.addColumn('firstName', 'text')
		.addColumn('lastName', 'text')
		.addColumn('lastLogin', 'datetime')
		.addColumn('roles', 'text')
		.addColumn('contactTel', 'text')
		.execute();

	await db.schema
	.createIndex('user_id_idx')
	.on('user')
	.column('id')
	.execute();
}


/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
	await db.schema
		.dropIndex('user_id_idx').execute()
		.dropTable('users').execute()
}