import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
	await db.schema
		.createTable('pathway')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('wid', 'text', (col) => col.notNull())
		.addColumn('title', 'text')
		.execute();

    await db.schema
        .createIndex('pathway_id_idx')
        .on('pathway')
        .column('id')
        .execute();
    
    await db.schema
        .createTable('step')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('pathway_id', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('order', 'integer')
        .addColumn('comment', 'text')
        .addColumn('activity', 'integer')       

    await db.schema
        .createIndex('step_id_idx')
        .on('step')
        .column('id')
        .execute();

    await db.schema
        .createTable('cons_uom')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('uom', 'text')
        .execute

    await db.schema
        .createTable('cons_type')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('type', 'text')
        .execute()

    await db.schema
        .createTable('consumable')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('reference', 'text')
        .addForeignKeyConstraint('consumable_uom_id_fk', ['uom_id'], 'cons_uom', ['id'],
        (cb) => cb.onDelete('restrict'))
        .addForeignKeyConstraint('consumable_type_id_fk', ['type_id'], 'cons_type', ['id'],
        (cb) => cb.onDelete('restrict'))
        .execute();

    await db.schema
        .createIndex('cons_id_idx')
        .on('consumable')
        .column('id')
        .execute();

        await db.schema
        .createTable('step_cons')
        .addColumn('step_id', 'integer', (col) => col.notNull())
        .addColumn('consumable_id', 'integer', (col) => col.notNull())
        .addColumn('primary_qty', 'decimal(8,4)')
        .addColumn('additional_qty', 'decimal(8,4)')
        .addForeignKeyConstraint('step_cons_step_id_fk', ['step_id'], 'step', ['id'],
            (cb) => cb.onDelete('cascade'))
        .addForeignKeyConstraint('step_cons_consumable_id_fk', ['consumable_id'], 'consumable', ['id'],
            (cb) => cb.onDelete('cascade'))
        .execute();

    await db.schema
}


/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
	await db.schema
        .dropIndex('pathway_id_idx').execute()
        .dropIndex('cons_id_idx').execute()
        
        .dropTable('step_cons').execute()
        .dropTable('consumable').execute()
        .dropTable('cons_type').execute()
        .dropTable('cons_uom').execute()
        
        .dropTable('step').execute()
		.dropTable('pathway').execute()
        
}