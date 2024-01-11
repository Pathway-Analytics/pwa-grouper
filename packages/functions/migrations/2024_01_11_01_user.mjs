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
		.addColumn('roles', 'text')
		.addColumn('lastLogin', 'timestamp')
		.addColumn('contactTel', 'text')
		.execute();

	await db.schema
		.createIndex('userId_idx')
		.on('users')
		.column('id')
		.execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema
  	.dropTable('users')
  	.dropIndex('userId_idx')
	.execute()
}