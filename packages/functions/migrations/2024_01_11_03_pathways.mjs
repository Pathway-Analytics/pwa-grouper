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
        .createIndex('pathwayId_idx')
        .on('pathway')
        .column('id')
        .execute();
    
    await db.schema
        .createTable('step')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('pathwayId', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('order', 'integer')
        .addColumn('comment', 'text')
        .addColumn('activity', 'integer')
        .execute();       

    await db.schema
        .createIndex('stepId_idx')
        .on('step')
        .column('id')
        .execute();

    await db.schema
        .createTable('consUom')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('uom', 'text')
        .execute();

    await db.schema
        .createTable('consType')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('type', 'text')
        .execute();

    await db.schema
        .createTable('consumable')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('uomId', 'text', (col) => col.notNull())
        .addColumn('typeId', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('reference', 'text')
        .addForeignKeyConstraint('consumableUomId_fk', ['uomId'], 'consUom', ['id'],
        (cb) => cb.onDelete('restrict'))
        .addForeignKeyConstraint('consumableTypeId_fk', ['typeId'], 'consType', ['id'],
        (cb) => cb.onDelete('restrict'))
        .execute();

    await db.schema
        .createIndex('consId_idx')
        .on('consumable')
        .column('id')
        .execute();

    await db.schema
        .createTable('stepCons')
        .addColumn('stepId', 'text', (col) => col.notNull())
        .addColumn('consId', 'text', (col) => col.notNull())
        .addColumn('primaryQty', 'decimal(8,4)')
        .addColumn('additionalQty', 'decimal(8,4)')
        .addForeignKeyConstraint('stepConsStepId_fk', ['stepId'], 'step', ['id'],
            (cb) => cb.onDelete('cascade'))
        .addForeignKeyConstraint('stepConsConsumableId_fk', ['consId'], 'consumable', ['id'],
            (cb) => cb.onDelete('cascade'))
        .execute();

        await db.schema
        .createTable('version')
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('title', 'text')
        .addColumn('description', 'text')
        .execute();

        await db.schema
        .createTable('version_price')
        .addColumn('consId', 'text', (col) => col.notNull())
        .addColumn('versionId', 'text', (col) => col.notNull())
        .addColumn('price', 'decimal(8,4)')
        .addForeignKeyConstraint('verPriVersion_fk', ['versionId'], 'version', ['id'], 
            (cb) => cb.onDelete('cascade'))
        .addForeignKeyConstraint('verPriConsumable_fk', ['consId'], 'consumable', ['id'],
            (cb) => cb.onDelete('cascade'))
        .execute();

}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    await db.schema
        .dropTable('version_price').execute()
        .dropTable('version').execute()
        .dropIndex('pathwayId_idx').execute()
        .dropIndex('consId_idx').execute()
        .dropTable('stepCons').execute()
        .dropTable('consumable').execute()
        .dropTable('consType').execute()
        .dropTable('consUom').execute()
        .dropTable('step').execute()
		.dropTable('pathway').execute()
        
}