import { Kysely, sql } from "kysely";


/**
 * @param db {Kysely<any>}
 */
export async function up(db) {

    await db.schema
        .createTable('framework')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .addColumn('lastChangedby', 'integer')
        .addForeignKeyConstraint(
            'fmwk_lastChangedby_fk', ['lastChangedby'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('validationOptionGp')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .execute();

    await db.schema
        .createTable('validationOption')
        .addColumn('id', 'integer',  (col) => col.autoIncrement().primaryKey())
        .addColumn('validationOptionGp_id', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .addColumn('description', 'varchar(2000)')
        .addColumn('code', 'varchar(50)')
        .addColumn('isLocal', 'boolean')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .addColumn('altOption', 'integer')
        .addForeignKeyConstraint('vo_vog_id_fk', ['validationOptionGp_id'], 'validationOptionGp', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('vo_altOption_fk', ['altOption'], 'validationOption', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('element')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('framework_id', 'integer', (col) => col.notNull())
        .addColumn('validationOptionGp_id', 'integer')
        .addColumn('fieldName', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('mask', 'varchar(50)')
        .addColumn('regexp', 'varchar(100)')
        .addColumn('isMandatory', 'boolean')
        .addColumn('isDate', 'boolean')
        .addColumn('isClinicList', 'boolean')
        .addColumn('isEpisodeIdentifier', 'boolean')
        .addColumn('isLSOA', 'boolean')
        .addColumn('Order', 'integer')
        .addColumn('altNames', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .addForeignKeyConstraint('elem_framework_id_fk', ['framework_id'], 'framework', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('elem_vog_id_fk', ['validationOptionGp_id'], 'validationOptionGp', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('adminArea')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('code', 'varchar(10)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('isActive', 'boolean')
        .addColumn('type', sql`enum('LSOA','LB','UA','NMD','MD','CTY','RGN','CTRY','NOT KNOWN')`)
        .addColumn('parent_id', 'integer')
        .addColumn('lastChanged', 'datetime')
        .addForeignKeyConstraint('admarea_parent_id_fk', ['parent_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('provider')
        .addColumn('id', 'integer',  (col) => col.autoIncrement().primaryKey())
        .addColumn('parentAdminArea_id', 'integer')
        .addColumn('name', 'varchar(200)')
        .addColumn('code', 'varchar(10)')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('isActive', 'boolean')
        .addForeignKeyConstraint('prov_parentAdminArea_id_fk', ['parentAdminArea_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('processStatus')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('label', 'varchar(50)')
        .addColumn('description', 'varchar(500)')
        .addColumn('order', 'integer')
        .addColumn('type', sql`enum('Submission','Sandbox','Validation', 'Report')`)
        .addColumn('isActive', 'boolean')
        .execute();
        
    await db.schema
        .createTable('submission')
        .addColumn('id', 'integer',  (col) => col.autoIncrement().primaryKey())
        .addColumn('provider_id', 'integer', (col) => col.notNull())
        .addColumn('processStatus_id', 'integer') 
        .addColumn('dateFrom', 'date')
        .addColumn('isHidden', 'boolean')
        .addColumn('totalTariff', 'decimal(6,2)')
        .addColumn('episodes', 'integer')
        .addColumn('records', 'integer')
        .addColumn('lastChanged', 'datetime')
        .addColumn('lastChangedby', 'integer')
        .addForeignKeyConstraint('subm_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('subm_lastChangedby_fk', ['lastChangedby'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('subm_processStatus_fk', ['processStatus_id'], 'processStatus', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('fileStub')
        .addColumn('id', 'integer',  (col) => col.autoIncrement().primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('fileName', 'varchar(200)')
        .addColumn('fileSize', 'integer')
        .addColumn('clinicList', 'varchar(500)')
        .addColumn('uploadedDate', 'datetime')
        .addColumn('uploadedBy', 'integer')
        .addColumn('status', sql`enum('NEW','PROCESSING','PROCESSED','ERROR')`)
        .addForeignKeyConstraint('filestb_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('filestb_uploadedBy_fk', ['uploadedBy'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('file')
        .addColumn('fileStub_id', 'integer', (col) => col.notNull())
        .addColumn('file', 'binary')
        .addForeignKeyConstraint('file_fileStub_id_fk', ['fileStub_id'], 'fileStub', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addPrimaryKeyConstraint('file_fileStub_id_pk', ['fileStub_id'])
        .execute();

    await db.schema
        .createTable('episode')
        .addColumn('episodeIdentifier', 'varchar(100)', (col) => col.primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('providerCode', 'varchar(50)')
        .addColumn('siteCode', 'varchar(50)')
        .addColumn('patient', 'varchar(50)')
        .addColumn('attendanceDate', 'date')
        .addColumn('lsoa', 'varchar(50)')
        .addForeignKeyConstraint('epi_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attribute')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('fileStub_id', 'integer', (col) => col.notNull())
        .addColumn('element_id', 'integer', (col) => col.notNull())
        .addColumn('episodeIdentifier', 'varchar(100)')
        .addColumn('record', 'varchar(50)')
        .addColumn('value', 'varchar(50)')
        .addColumn('dateValue', 'date')
        .addForeignKeyConstraint('att_episodeIdentifier_fk', ['episodeIdentifier'], 'episode', ['episodeIdentifier'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('att_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('att_fileStub_id_fk', ['fileStub_id'], 'fileStub', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('att_element_id_fk', ['element_id'], 'element', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attributeError')
        .addColumn('attribute_id', 'integer', (col) => col.primaryKey())
        .addColumn('error', 'varchar(500)')
        .addForeignKeyConstraint('attErr_attribute_id_fk', ['attribute_id'], 'attribute', ['id'], 
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configuration')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('startDate', 'date')
        .addColumn('endDate', 'date')
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('submitWithin', 'integer')
        .addColumn('isHideRates', 'boolean')
        .addForeignKeyConstraint('config_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('currency')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(100)')
        .addColumn('nameShort', 'varchar(10)')
        .addColumn('primaryTariff', 'decimal(6,2)')
        .addColumn('additionalTariff', 'decimal(6,2)')
        .addColumn('crossChargeType', sql`enum('NONE','FULL','LOCAL LIMITED', 'LOCAL UNLIMITED')`)
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .addForeignKeyConstraint('curr_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configurationCombSet')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addForeignKeyConstraint('confccs_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configurationComb')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('configurationCombSet_id', 'integer', (col) => col.notNull())
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('role', sql`enum('IF','THEN')`)
        .addForeignKeyConstraint('configcc_configurationCombSet_id_fk', ['configurationCombSet_id'], 'configurationCombSet', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('configcc_currency_id_fk', ['currency_id'], 'currency', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('participatingOrgs')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addColumn('adminArea_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('factor', 'decimal(6,5)')
        .addForeignKeyConstraint('partorg_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('partorg_adminArea_id_fk', ['adminArea_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('partorg_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('currencyTriggerSet')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('description', 'varchar(200)')
        .addColumn('lastChanged', 'datetime')
        .addForeignKeyConstraint('currts_currency_id_fk', ['currency_id'], 'currency', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('currencyTrigger')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('currencyTriggerSet_id', 'integer', (col) => col.notNull())
        .addColumn('validationOption_id', 'integer', (col) => col.notNull())
        .addColumn('isNot', 'boolean')
        .addForeignKeyConstraint('currt_currencyTriggerSet_id_fk', ['currencyTriggerSet_id'], 'currencyTriggerSet', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('currt_validationOption_id_fk', ['validationOption_id'], 'validationOption', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('charge')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('episodeIdentifier', 'varchar(100)')
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('provider_id', 'integer', (col) => col.notNull())
        .addColumn('commissioner_id', 'integer', (col) => col.notNull())
        .addColumn('primaryTariff', 'decimal(6,2)')
        .addColumn('additionalTariff', 'decimal(6,2)')
        .addForeignKeyConstraint('charge_episodeIdentifier', ['episodeIdentifier'], 'episode', ['episodeIdentifier'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('charge_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('charge_currency_id_fk', ['currency_id'], 'currency', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('charge_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('charge_commissioner_id_fk', ['commissioner_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('clinic')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('code', 'varchar(50)')
        .addColumn('provider_id', 'integer')
        .addColumn('commissioner_id', 'integer')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(10,8)')
        .addColumn('lng', 'decimal(10,8)')
        .addForeignKeyConstraint('clinic_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('clinic_commissioner_id_fk', ['commissioner_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('contact_xero')
        .addColumn('xero_contact_id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('linkToProvider_ID', 'integer')
        .addColumn('linkToAdminArea_ID', 'integer')
        .addForeignKeyConstraint('contx_linkToProvider_ID_fk', ['linkToProvider_ID'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('contx_linkToAdminArea_ID_fk', ['linkToAdminArea_ID'], 'adminArea', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('xero_invoice')
        .addColumn('id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('type', 'varchar(50)')
        .addColumn('invoiceNo', 'varchar(50)')
        .addColumn('reference', 'varchar(50)')
        .addColumn('amountDue', 'decimal(9,2)')
        .addColumn('amountPaid', 'decimal(9,2)')
        .addColumn('amountCredited', 'decimal(9,2)')
        .addColumn('currencyRate', 'decimal(9,4)')        
        .addColumn('hasErrors', 'boolean')
        .addColumn('isDiscounted', 'boolean')
        .addColumn('dateString', 'date')
        .addColumn('dueDateString', 'date')
        .addColumn('brandingTheme', 'varchar(50)')
        .addColumn('url', 'varchar(500)')
        .addColumn('status', 'varchar(50)')
        .addColumn('lineAmountTypes', 'varchar(500)')
        .addColumn('subTotal', 'decimal(9,2)')
        .addColumn('totalTax', 'decimal(9,2)')
        .addColumn('total', 'decimal(9,2)')
        .addColumn('currencyCode', 'varchar(50)')
        .addColumn('sentToContact', 'boolean')
        .addColumn('expectedPaymentDate', 'date')
        .addColumn('plannedPaymentDate', 'date')
        .addColumn('totalDiscount', 'decimal(9,2)')
        .addColumn('fullyPaidOnDate', 'date')
        .addColumn('updatedUTC', 'datetime')
        .execute();

    await db.schema
        .createTable('contact_invoice')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('xero_invoice_id', 'integer')
        .addColumn('xero_contact_id', 'integer')
        .execute();
    
    await db.schema 
        .createTable('xero_quote')
        .addColumn('id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('type', 'varchar(50)')
        .addColumn('quoteNo', 'varchar(50)')
        .addColumn('reference', 'varchar(50)')
        .addColumn('currencyRate', 'decimal(9,2)')
        .addColumn('hasErrors', 'boolean')
        .addColumn('isDiscounted', 'boolean')
        .addColumn('hasAttachements', 'boolean')
        .addColumn('dateString', 'date')
        .addColumn('brandingTheme', 'varchar(50)')
        .addColumn('url', 'varchar(500)')
        .addColumn('status', 'varchar(50)')
        .addColumn('lineAmountTypes', 'varchar(500)')
        .addColumn('subTotal', 'decimal(9,2)')
        .addColumn('totalTax', 'decimal(9,2)')
        .addColumn('total', 'decimal(9,2)')
        .addColumn('currencyCode', 'varchar(50)')
        .addColumn('sentToContact', 'boolean')
        .addColumn('totalDiscount', 'decimal(9,2)')
        .addColumn('updatedUTC', 'datetime')
        .execute();

    await db.schema
        .createTable('contact_quote')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('xero_quote_id', 'integer')
        .addColumn('xero_contact_id', 'integer')
        .execute();

    await db.schema
        .createTable('xero_line_item')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('lineItemId', 'varchar(50)')
        .addColumn('xero_invoice_id', 'integer')
        .addColumn('xero_quote_id', 'integer')
        .addColumn('description', 'varchar(2000)')
        .addColumn('quantity', 'decimal(9,2)')
        .addColumn('unitAmount', 'decimal(9,2)')
        .addColumn('itemCode', 'varchar(50)')
        .addColumn('accountCode', 'varchar(50)')
        .addColumn('taxType', 'varchar(50)')
        .addColumn('taxAmount', 'decimal(9,2)')
        .addColumn('lineAmount', 'decimal(9,2)')
        .addColumn('discountRate', 'decimal(9,2)')
        .execute();

    await db.schema
        .createTable('userSubscription')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('role', sql`enum('ADMIN', 'COMMISSIONER', 'PROVIDER+', 'PROVIDER_BASIC', 'PROVIDER_READ_ONLY')`)
        .addColumn('xero_invoice_id', 'varchar(50)')
        .addColumn('renewalInvoice_id', 'varchar(50)')
        .addColumn('renewalQuote_id', 'varchar(50)')
        .addColumn('user_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('adminArea_id', 'integer')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .addColumn('invoiceNo', 'varchar(50)')
        .addColumn('startDate','date')
        .addColumn('endDate','date')
        .addForeignKeyConstraint('usub_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usub_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usub_adminArea_id_fk', ['adminArea_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();    

    await db.schema
        .createTable('reportType')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(50)')
        .addColumn('nameButton', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'datetime')
        .execute();

    await db.schema
        .createTable('reportRequest')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('reportType_id', 'integer')
        .addColumn('user_id', 'integer')
        .addColumn('processStatus_id', 'integer')
        .addColumn('decription', 'varchar(2000)')
        .addColumn('startFrom', 'date')
        .addColumn('period', 'integer')
        .addColumn('isEmail', 'boolean')
        .addColumn('csvProviders', 'varchar(250)')
        .addColumn('csvCommissioners', 'varchar(250)')
        .addColumn('requestProfile', sql`enum('PROVIDER', 'COMMISSIONER')`)
        .addColumn('guid', 'varchar(50)')
        .addColumn('fileName', 'varchar(50)')
        .addColumn('fileSize', 'integer')
        .addColumn('error', 'varchar(200)')
        .addColumn('created', 'datetime')
        .addColumn('lastChanged', 'datetime')
        .addColumn('reportRequestJSON', 'varchar(2000)')
        .addForeignKeyConstraint('repreq_reportType_id_fk', ['reportType_id'], 'reportType', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreq_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreq_processStatus_fk', ['processStatus_id'], 'processStatus', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('reportRequestFile')        
        .addColumn('reportRequest_id', 'integer')
        .addColumn('file', 'binary')
        .addForeignKeyConstraint('repreqf_reportRequest_id_fk', ['reportRequest_id'], 'reportRequest', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addPrimaryKeyConstraint('repreqf_reportRequest_id_pk', ['reportRequest_id'])
        .execute();

    await db.schema
        .createTable('reportChunk')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('reportRequest_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('commissioner_id', 'integer')
        .addColumn('dateFrom', 'date')
        .addForeignKeyConstraint('repchk_reportRequest_id_fk', ['reportRequest_id'], 'reportRequest', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchk_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchk_commissioner_id_fk', ['commissioner_id'], 'adminArea', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpi')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('uom', 'varchar(50)')
        .addColumn('numerator', 'varchar(1000)')
        .addColumn('denominator', 'varchar(1000)')
        .addColumn('serial', 'varchar(50)')
        .addColumn('lastChanged', 'datetime')
        .execute();

    await db.schema
        .createTable('kpiSql')
        .addColumn('kpi_id', 'integer')
        .addColumn('sql', 'binary')
        .addForeignKeyConstraint('ksql_kpi_id_fk', ['kpi_id'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addPrimaryKeyConstraint('kpiSql_id_pk', ['kpi_id'])
        .execute();

    await db.schema
        .createTable('kpiLibrary')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer')
        .addColumn('kpi_id', 'integer')
        .addColumn('order', 'integer')
        .addForeignKeyConstraint('klib_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('klib_kpi_id_fk', ['kpi_id'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpiResult')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('kpi_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('submission_id', 'integer')
        .addColumn('numerator', 'varchar(50)')
        .addColumn('denominator', 'varchar(50)')
        .addColumn('uom', 'varchar(50)')
        .addColumn('created', 'datetime')
        .addForeignKeyConstraint('kres_kpi_id_fk', ['kpi_id'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kres_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kres_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpiFormat')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('kpi_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('user_id', 'integer')
        .addColumn('upperValue', 'decimal(6,2)')
        .addColumn('lowerValue', 'decimal(6,2)')
        .addColumn('upperTxtColour', 'varchar(50)')
        .addColumn('midTxtColour', 'varchar(50)')
        .addColumn('lowerTxtColour', 'varchar(50)')
        .addColumn('upperBkgdColour', 'varchar(50)')
        .addColumn('midBkgdColour', 'varchar(50)')
        .addColumn('lowerBkgdColour', 'varchar(50)')
        .addForeignKeyConstraint('kformat_kpi_id_fk', ['kpi_id'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kformat_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kformat_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('notification')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .execute();

    await db.schema
        .createTable('userNotification')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer')
        .addColumn('notification_id', 'integer')
        .addForeignKeyConstraint('unot_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('unot_notification_id_fk', ['notification_id'], 'notification', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('page')
        .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
        .addColumn('user_id', 'integer')
        .addColumn('code', 'varchar(100)')
        .addColumn('title', 'varchar(100)')
        .addColumn('content', 'binary')
        .addColumn('pageType', sql`enum ('HELP','UPDATE','PAGE')`)
        .addColumn('availableFrom', 'datetime')
        .addColumn('changed', 'datetime')
        .addColumn('created', 'datetime')
        .addColumn('isActive', 'boolean')
        .addColumn('tags', 'varchar(1000)')
        .addForeignKeyConstraint('pg_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createIndex('framework_id_idx')
        .on('framework')
        .column('id')
        .execute();

    await db.schema
        .createIndex('validationOptionGp_id_idx')
        .on('validationOptionGp')
        .column('id')
        .execute();

    await db.schema
        .createIndex('validationOption_id_idx')
        .on('validationOption')
        .column('id')
        .execute();

    await db.schema
        .createIndex('vo_vog_id_idx')
        .on('validationOption')
        .column('validationOptionGp_id')
        .execute();

    await db.schema
        .createIndex('element_id_idx')
        .on('element')
        .column('id')
        .execute();

    await db.schema
        .createIndex('element_framework_vog_idx')
        .on('element')
        .column('framework_id')
        .column('validationOptionGp_id')
        .execute();

    await db.schema
        .createIndex('provider_id_idx')
        .on('provider')
        .column('id')
        .execute();

    await db.schema
        .createIndex('provider_code_idx')
        .on('provider')
        .column('code')
        .execute();

    await db.schema
        .createIndex('adminArea_id_idx')
        .on('adminArea')
        .column('id')
        .execute();

    await db.schema
        .createIndex('adminArea_type_isactive_idx')
        .on('adminArea')
        .column('type')
        .column('isActive')
        .execute();

    await db.schema
        .createIndex('submission_id_idx')
        .on('submission')
        .column('id')
        .execute();

    await db.schema
        .createIndex('submission_dt_isH_prov_idx')
        .on('submission')
        .column('datefrom')
        .column('isHidden')
        .column('provider_id')
        .execute();

    await db.schema
        .createIndex('fileStub_id_idx')
        .on('fileStub')
        .column('id')
        .execute();

    await db.schema
        .createIndex('fileStub_submission_idx')
        .on('fileStub')
        .column('submission_id')
        .execute();

    await db.schema
        .createIndex('file_filestub_idx')
        .on('file')
        .column('fileStub_id')
        .execute();

    await db.schema
        .createIndex('episode_id_idx')
        .on('episode')
        .column('episodeIdentifier')
        .execute();

    await db.schema
        .createIndex('episode_submission_idx')
        .on('episode')
        .column('submission_id')
        .execute();

    await db.schema
        .createIndex('attribute_id_idx')
        .on('attribute')
        .column('id')
        .execute();

    await db.schema
        .createIndex('attribute_submission_episode_idx')
        .on('attribute')
        .column('submission_id')
        .column('episodeIdentifier')
        .execute();

    await db.schema
        .createIndex('attribute_submission_id_idx')
        .on('attribute')
        .column('submission_id')
        .execute()

    await db.schema
        .createIndex('attribute_fileStub_id_idx')
        .on('attribute')
        .column('fileStub_id')
        .execute()

    await db.schema
        .createIndex('attributeError_id_idx')
        .on('attributeError')
        .column('attribute_id')
        .execute();

    await db.schema
        .createIndex('configuration_id_idx')
        .on('configuration')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currency_id_idx')
        .on('currency')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currency_config_idx')
        .on('currency')
        .column('configuration_id')
        .execute();

    await db.schema
        .createIndex('configurationCombSet_id_idx')
        .on('configurationCombSet')
        .column('id')
        .execute();

    await db.schema
        .createIndex('configurationComb_id_idx')
        .on('configurationComb')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participatingOrgs_id_idx')
        .on('participatingOrgs')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participatingOrgs_conf_adminarea_idx')
        .on('participatingOrgs')
        .column('configuration_id')
        .column('adminArea_id')
        .execute();

    await db.schema
        .createIndex('participatingOrgs_conf_provider_idx')
        .on('participatingOrgs')
        .column('configuration_id')
        .column('provider_id')
        .execute();

    await db.schema
        .createIndex('currencyTriggerSet_id_idx')
        .on('currencyTriggerSet')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currencyTrigger_id_idx')
        .on('currencyTrigger')
        .column('id')
        .execute();

    await db.schema
        .createIndex('charge_id_idx')
        .on('charge')
        .column('id')
        .execute();

    await db.schema
        .createIndex('charge_submission_id_idx')
        .on('charge')
        .column('submission_id')
        .execute();

    await db.schema
        .createIndex('userSubscription_id_idx')
        .on('userSubscription')
        .column('id')
        .execute();

    await db.schema
        .createIndex('reportRequest_id_idx')
        .on('reportRequest')
        .column('id')
        .execute();

    await db.schema
        .createIndex('reportRequestFile_id_idx')
        .on('reportRequestFile')
        .column('reportRequest_id')
        .execute();

    await db.schema
        .createIndex('reportChunk_id_idx')
        .on('reportChunk')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpi_id_idx')
        .on('kpi')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiSql_id_idx')
        .on('kpiSql')
        .column('kpi_id')
        .execute();

    await db.schema
        .createIndex('kpiLibrary_id_idx')
        .on('kpiLibrary')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiResult_id_idx')
        .on('kpiResult')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiFormat_id_idx')
        .on('kpiFormat')
        .column('id')
        .execute();

    await db.schema
        .createIndex('notification_id_idx')
        .on('notification')
        .column('id')
        .execute();

    await db.schema
        .createIndex('userNotification_id_idx')
        .on('userNotification')
        .column('id')
        .execute();

    await db.schema
        .createIndex('page_id_idx')
        .on('page')
        .column('id')
        .execute();
}
/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    
    await db.schema
        .dropIndex('framework_id_idx').execute()
        .dropIndex('validationOptionGp_id_idx').execute()
        .dropIndex('validationOption_id_idx').execute()
        .dropIndex('vo_vog_id_idx').execute()
        .dropIndex('element_id_idx').execute()
        .dropIndex('element_framework_vog_idx').execute()
        .dropIndex('provider_id_idx').execute()
        .dropIndex('provider_code_idx').execute()
        .dropIndex('adminArea_id_idx').execute()
        .dropIndex('adminArea_type_isactive_idx').execute()
        .dropIndex('submission_id_idx').execute()
        .dropIndex('submission_dt_isH_prov_idx').execute()
        .dropIndex('fileStub_id_idx').execute()
        .dropIndex('fileStub_submission_idx').execute()
        .dropIndex('file_filestub_idx').execute()
        .dropIndex('episode_id_idx').execute()
        .dropIndex('episode_submission_idx').execute()
        .dropIndex('attribute_id_idx').execute()
        .dropIndex('attribute_submission_episode_idx').execute()
        .dropIndex('attribute_submission_id_idx').execute()
        .dropIndex('attribute_fileStub_id_idx').execute()
        .dropIndex('attributeError_id_idx').execute()
        .dropIndex('configuration_id_idx').execute()
        .dropIndex('currency_id_idx').execute()
        .dropIndex('currency_config_idx').execute()
        .dropIndex('configurationCombSet_id_idx').execute()
        .dropIndex('configurationComb_id_idx').execute()
        .dropIndex('participatingOrgs_id_idx').execute()
        .dropIndex('participatingOrgs_conf_adminarea_idx').execute()
        .dropIndex('participatingOrgs_conf_provider_idx').execute()
        .dropIndex('currencyTriggerSet_id_idx').execute()
        .dropIndex('currencyTrigger_id_idx').execute()
        .dropIndex('charge_id_idx').execute()
        .dropIndex('charge_submission_id_idx').execute()
        .dropIndex('userSubscription_id_idx').execute()
        .dropIndex('reportRequest_id_idx').execute()
        .dropIndex('reportRequestFile_id_idx').execute()
        .dropIndex('reportChunk_id_idx').execute()
        .dropIndex('kpi_id_idx').execute()
        .dropIndex('kpiSql_id_idx').execute()
        .dropIndex('kpiLibrary_id_idx').execute()
        .dropIndex('kpiResult_id_idx').execute()
        .dropIndex('kpiFormat_id_idx').execute()
        .dropIndex('notification_id_idx').execute()
        .dropIndex('userNotification_id_idx').execute()
        .dropIndex('page_id_idx').execute()
   
        .dropTable('page').execute()
        .dropTable('userNotification').execute()
        .dropTable('notification').execute()
        .dropTable('kpiFormat').execute()
        .dropTable('kpiResult').execute()
        .dropTable('kpiLibrary').execute()
        .dropTable('kpiSql').execute()
        .dropTable('kpi').execute()
        .dropTable('reportChunk').execute()
        .dropTable('reportRequestFile').execute()
        .dropTable('reportRequest').execute()
        .dropTable('reportType').execute()
        .dropTable('userSubscription').execute()
        .dropTable('xero_line_item').execute()
        .dropTable('contact_quote').execute()
        .dropTable('xero_quote').execute()
        .dropTable('contact_invoice').execute()
        .dropTable('xero_invoice').execute()
        .dropTable('contact_xero').execute()
        .dropTable('clinic').execute()
        .dropTable('charge').execute()
        .dropTable('currencyTrigger').execute()
        .dropTable('currencyTriggerSet').execute()
        .dropTable('participatingOrgs').execute()
        .dropTable('configurationComb').execute()
        .dropTable('configurationCombSet').execute()
        .dropTable('currency').execute()
        .dropTable('configuration').execute()
        .dropTable('attributeError').execute()
        .dropTable('attribute').execute()
        .dropTable('episode').execute()
        .dropTable('file').execute()
        .dropTable('fileStub').execute()
        .dropTable('submission').execute()
        .dropTable('processStatus').execute()
        .dropTable('provider').execute()
        .dropTable('adminArea').execute()
        .dropTable('element').execute()
        .dropTable('validationOption').execute()
        .dropTable('validationOptionGp').execute()
        .dropTable('framework').execute()
}
