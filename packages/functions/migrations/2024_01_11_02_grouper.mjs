import { Kysely, sql } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {

    await db.schema
    .createType('role')
    .asEnum([
        'ADMIN', 
        'COMMISSIONER', 
        'PROVIDER_PLUS', 
        'PROVIDER_BASIC', 
        'PROVIDER_READ_ONLY'
    ])
    .execute();

    // .addColumn("status", sql`status`)
    
    await db.schema
    .createType('adminAreaType')
    .asEnum([
        'LSOA',
        'LB',
        'UA',
        'NMD',
        'MD',
        'CTY',
        'RGN',
        'CTRY',
        'NOT KNOWN'
    ])
    .execute();

    await db.schema
    .createType('processStatusType')
    .asEnum([
        'Submission',
        'Sandbox',
        'Validation',
        'Report'
    ])
    .execute();
    
    await db.schema
    .createType('fileStubStatusType')
    .asEnum([
        'NEW',
        'PROCESSING',
        'PROCESSED',
        'ERROR'
    ])
    .execute();
    
    await db.schema
    .createType('pageType')
    .asEnum([
        'HELP',
        'UPDATE',
        'PAGE'
    ])
    .execute();

    await db.schema
    .createType('currencyCrossChargeType')
    .asEnum([
        'NONE',
        'FULL',
        'LOCAL LIMITED', 
        'LOCAL UNLIMITED'
    ])
    .execute();
    
    await db.schema
    .createType('ifThenType')
    .asEnum([
        'IF',
        'THEN',
    ])
    .execute();
    
    await db.schema
        .createTable('framework')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .addColumn('lastChangedBy', 'text')
        .addForeignKeyConstraint(
            'fmwkLastChangedBy_fk', ['lastChangedBy'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('validationOptionGp')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .execute();

    await db.schema
        .createTable('validationOption')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('validationOptionGpId', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .addColumn('description', 'varchar(2000)')
        .addColumn('code', 'varchar(50)')
        .addColumn('isLocal', 'boolean')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .addColumn('altOption', 'integer')
        .addForeignKeyConstraint('voVogId_fk', ['validationOptionGpId'], 'validationOptionGp', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('voAltOption_fk', ['alOoption'], 'validationOption', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('element')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('frameworkId', 'integer', (col) => col.notNull())
        .addColumn('validationOptionGpId', 'integer')
        .addColumn('fieldName', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('mask', 'varchar(50)')
        .addColumn('regexp', 'varchar(100)')
        .addColumn('isMandatory', 'boolean')
        .addColumn('isDate', 'boolean')
        .addColumn('isClinicList', 'boolean')
        .addColumn('isEpisodeIdentifier', 'boolean')
        .addColumn('isLsoa', 'boolean')
        .addColumn('order', 'integer')
        .addColumn('altNames', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .addForeignKeyConstraint('elemFrameworkId_fk', ['frameworkId'], 'framework', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('elemVogId_fk', ['validationOptionGpId'], 'validationOptionGp', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('adminArea')
        .addColumn('code', 'varchar(10)', (col) => col.primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('isActive', 'boolean')
        .addColumn('type', sql`"adminAreaType"`)
        .addColumn('parentCode', 'varchar(10)')
        .addColumn('lastChanged', 'timestamp')
        .addForeignKeyConstraint('admAreaParentCode_fk', ['parentCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('provider')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('parentAdminAreaCode', 'varchar(10)')
        .addColumn('name', 'varchar(200)')
        .addColumn('code', 'varchar(10)')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('isActive', 'boolean')
        .addForeignKeyConstraint('provParentAdminAreaCode_fk', ['parentAdminAreaCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('processStatus')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('label', 'varchar(50)')
        .addColumn('description', 'varchar(500)')
        .addColumn('order', 'integer')
        .addColumn('type', sql`"processStatusType"`)
        .addColumn('isActive', 'boolean')
        .execute();
        
    await db.schema
        .createTable('submission')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('providerId', 'integer', (col) => col.notNull())
        .addColumn('processStatusId', 'integer') 
        .addColumn('ExtId', 'integer') 
        .addColumn('dateFrom', 'date')
        .addColumn('isHidden', 'boolean')
        .addColumn('totalTariff', 'decimal(6,2)')
        .addColumn('episodes', 'integer')
        .addColumn('records', 'integer')
        .addColumn('lastChanged', 'timestamp')
        .addColumn('lastChangedBy', 'text')
        .addForeignKeyConstraint('submProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('submLastChangedBy_fk', ['lastChangedBy'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('submProcessStatus_fk', ['processStatusId'], 'processStatus', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('fileStub')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('ExtId', 'integer') 
        .addColumn('submissionId', 'integer', (col) => col.notNull())
        .addColumn('fileName', 'varchar(200)')
        .addColumn('fileSize', 'integer')
        .addColumn('clinicList', 'varchar(500)')
        .addColumn('uploadedDate', 'timestamp')
        .addColumn('uploadedBy', 'text')
        .addColumn('fileUrl', 'text')
        .addColumn('status', sql`"fileStubStatusType"`)
        .addForeignKeyConstraint('filestbSubmissionId_fk', ['submissionId'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('filestbIUploadedBy_fk', ['uploadedBy'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('episode')
        .addColumn('episodeIdentifier', 'varchar(100)', (col) => col.primaryKey())
        .addColumn('submissionId', 'integer', (col) => col.notNull())
        .addColumn('providerCode', 'varchar(50)')
        .addColumn('siteCode', 'varchar(50)')
        .addColumn('patient', 'varchar(50)')
        .addColumn('attendanceDate', 'date')
        .addColumn('lsoa', 'varchar(50)')
        .addForeignKeyConstraint('epiSubmissionId_fk', ['submissionId'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attribute')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('ExtId', 'integer') 
        .addColumn('submissionId', 'integer', (col) => col.notNull())
        .addColumn('fileStubId', 'integer', (col) => col.notNull())
        .addColumn('elementId', 'integer', (col) => col.notNull())
        .addColumn('episodeIdentifier', 'varchar(100)')
        .addColumn('record', 'varchar(50)')
        .addColumn('value', 'varchar(50)')
        .addColumn('dateValue', 'date')
        .addForeignKeyConstraint('attEpisodeIdentifier_fk', ['episodeIdentifier'], 'episode', ['episodeIdentifier'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('attSubmissionId_fk', ['submissionId'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('attFileStubId_fk', ['fileStubId'], 'fileStub', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('attElementId_fk', ['elementId'], 'element', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attributeError')
        .addColumn('attributeId', 'integer', (col) => col.primaryKey())
        .addColumn('error', 'varchar(500)')
        .addForeignKeyConstraint('attErrAttributeId_fk', ['attributeId'], 'attribute', ['id'], 
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configuration')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('startDate', 'date')
        .addColumn('endDate', 'date')
        .addColumn('userId', 'text', (col) => col.notNull())
        .addColumn('submitWithin', 'integer')
        .addColumn('isHideRates', 'boolean')
        .addForeignKeyConstraint('configUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('currency')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('ExtId', 'integer') 
        .addColumn('configurationId', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(100)')
        .addColumn('nameShort', 'varchar(10)')
        .addColumn('primaryTariff', 'decimal(6,2)')
        .addColumn('additionalTariff', 'decimal(6,2)')
        .addColumn('crossChargeType', sql`"currencyCrossChargeType"`)
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .addForeignKeyConstraint('currConfigurationId_fk', ['configurationId'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configurationCombSet')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configurationId', 'integer', (col) => col.notNull())
        .addForeignKeyConstraint('confccsConfigurationId_fk', ['configurationId'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configurationComb')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configurationCombSetId', 'integer', (col) => col.notNull())
        .addColumn('currencyId', 'integer', (col) => col.notNull())
        .addColumn('role', sql`"ifThenType"`)
        .addForeignKeyConstraint('configccConfigurationCombSetId_fk', ['configurationCombSetId'], 'configurationCombSet', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('configccCurrencyId_fk', ['currencyId'], 'currency', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('participatingOrgs')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configurationId', 'integer', (col) => col.notNull())
        .addColumn('adminAreaCode', 'varchar(10)')
        .addColumn('providerId', 'integer')
        .addColumn('factor', 'decimal(6,5)')
        .addForeignKeyConstraint('partorgConfigurationId_fk', ['configurationId'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('partorgAdminAreaCode_fk', ['adminAreaCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('partOrgProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('currencyTriggerSet')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('currencyId', 'integer', (col) => col.notNull())
        .addColumn('description', 'varchar(200)')
        .addColumn('lastChanged', 'timestamp')
        .addForeignKeyConstraint('currtsCurrencyId_fk', ['currencyId'], 'currency', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('currencyTrigger')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('currencyTriggerSetId', 'integer', (col) => col.notNull())
        .addColumn('validationOptionId', 'integer', (col) => col.notNull())
        .addColumn('isNot', 'boolean')
        .addForeignKeyConstraint('currtCurrencyTriggerSetId_fk', ['currencyTriggerSetId'], 'currencyTriggerSet', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('currtValidationOptionId_fk', ['validationOptionId'], 'validationOption', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('charge')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('ExtId', 'integer') 
        .addColumn('submissionId', 'integer', (col) => col.notNull())
        .addColumn('episodeIdentifier', 'varchar(100)')
        .addColumn('currencyId', 'integer', (col) => col.notNull())
        .addColumn('providerId', 'integer', (col) => col.notNull())
        .addColumn('commissionerCode', 'varchar(10)', (col) => col.notNull())
        .addColumn('primaryTariff', 'decimal(6,2)')
        .addColumn('additionalTariff', 'decimal(6,2)')
        .addForeignKeyConstraint('chargeEpisodeIdentifier', ['episodeIdentifier'], 'episode', ['episodeIdentifier'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('chargeSubmissionId_fk', ['submissionId'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('chargeCurrencyId_fk', ['currencyId'], 'currency', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('chargeProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('chargeCommissionerCode_fk', ['commissionerCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('clinic')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('code', 'varchar(50)')
        .addColumn('providerId', 'integer')
        .addColumn('commissionerCode', 'varchar(10)')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(10,8)')
        .addColumn('lng', 'decimal(10,8)')
        .addForeignKeyConstraint('clinicProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('clinicCommissionerCode_fk', ['commissionerCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('contactXero')
        .addColumn('xeroContactId', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('linkToProviderId', 'integer')
        .addColumn('linkToAdminAreaCode', 'varchar(10)')
        .addForeignKeyConstraint('contxLinkToProviderId_fk', ['linkToProviderId'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('contxLinkToAdminAreaCode_fk', ['linkToAdminAreaCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('xeroInvoice')
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
        .addColumn('updatedUtc', 'timestamp')
        .execute();

    await db.schema
        .createTable('contactInvoice')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('xeroInvoiceId', 'integer')
        .addColumn('xeroContactId', 'integer')
        .execute();
    
    await db.schema 
        .createTable('xeroQuote')
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
        .addColumn('updatedUtc', 'timestamp')
        .execute();

    await db.schema
        .createTable('contactQuote')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('xeroQuoteId', 'integer')
        .addColumn('xeroContactId', 'integer')
        .execute();

    await db.schema
        .createTable('xeroLineItem')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('lineItemId', 'varchar(50)')
        .addColumn('xeroInvoiceId', 'integer')
        .addColumn('xeroQuoteId', 'integer')
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
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('role', sql`role`)
        .addColumn('xeroInvoiceId', 'varchar(50)')
        .addColumn('renewalInvoiceId', 'varchar(50)')
        .addColumn('renewalQuoteId', 'varchar(50)')
        .addColumn('userId', 'text')
        .addColumn('providerId', 'integer')
        .addColumn('adminAreaCode', 'varchar(10)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .addColumn('invoiceNo', 'varchar(50)')
        .addColumn('startDate','date')
        .addColumn('endDate','date')
        .addForeignKeyConstraint('usubUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usubProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usubAdminAreaCode_fk', ['adminAreaCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();    

    await db.schema
        .createTable('reportType')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(50)')
        .addColumn('nameButton', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('lastChanged', 'timestamp')
        .execute();

    await db.schema
        .createTable('reportRequest')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('reportTypeId', 'integer')
        .addColumn('userId', 'text')
        .addColumn('processStatusId', 'integer')
        .addColumn('decription', 'varchar(2000)')
        .addColumn('startFrom', 'date')
        .addColumn('period', 'integer')
        .addColumn('isEmail', 'boolean')
        .addColumn('csvProviders', 'varchar(250)')
        .addColumn('csvCommissioners', 'varchar(250)')
        .addColumn('requestProfile', sql`role`)
        .addColumn('guid', 'varchar(50)')
        .addColumn('fileName', 'varchar(50)')
        .addColumn('fileUrl', 'text')        
        .addColumn('fileSize', 'integer')
        .addColumn('error', 'varchar(200)')
        .addColumn('created', 'timestamp')
        .addColumn('lastChanged', 'timestamp')
        .addColumn('reportRequestJson', 'varchar(2000)')
        .addForeignKeyConstraint('repreqReportTypeId_fk', ['reportTypeId'], 'reportType', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreqUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreqProcessStatus_fk', ['processStatusId'], 'processStatus', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('reportChunk')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('reportRequestId', 'integer')
        .addColumn('providerId', 'integer')
        .addColumn('commissionerCode', 'varchar(10)')
        .addColumn('dateFrom', 'date')
        .addForeignKeyConstraint('repchkReportRequestId_fk', ['reportRequestId'], 'reportRequest', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchkProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchkCommissionerCode_fk', ['commissionerCode'], 'adminArea', ['code'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpi')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('ExtId', 'integer') 
        .addColumn('name', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .addColumn('uom', 'varchar(50)')
        .addColumn('numerator', 'varchar(1000)')
        .addColumn('denominator', 'varchar(1000)')
        .addColumn('serial', 'varchar(50)')
        .addColumn('lastChanged', 'timestamp')
        .execute();

    await db.schema
        .createTable('kpiSql')
        .addColumn('kpiId', 'integer')
        .addColumn('sql', 'bytea')
        .addForeignKeyConstraint('ksqlKpiId_fk', ['kpiId'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addPrimaryKeyConstraint('kpiSqlId_pk', ['kpiId'])
        .execute();

    await db.schema
        .createTable('kpiLibrary')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('userId', 'text')
        .addColumn('kpiId', 'integer')
        .addColumn('order', 'integer')
        .addForeignKeyConstraint('klibUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('klibKpiId_fk', ['kpiId'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpiResult')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('kpiId', 'integer')
        .addColumn('providerId', 'integer')
        .addColumn('submissionId', 'integer')
        .addColumn('numerator', 'varchar(50)')
        .addColumn('denominator', 'varchar(50)')
        .addColumn('uom', 'varchar(50)')
        .addColumn('created', 'timestamp')
        .addForeignKeyConstraint('kresKpiId_fk', ['kpiId'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kresProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kresSubmissionId_fk', ['submissionId'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpiFormat')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('kpiId', 'integer')
        .addColumn('providerId', 'integer')
        .addColumn('userId', 'text')
        .addColumn('upperValue', 'decimal(6,2)')
        .addColumn('lowerValue', 'decimal(6,2)')
        .addColumn('upperTxtColour', 'varchar(50)')
        .addColumn('midTxtColour', 'varchar(50)')
        .addColumn('lowerTxtColour', 'varchar(50)')
        .addColumn('upperBkgdColour', 'varchar(50)')
        .addColumn('midBkgdColour', 'varchar(50)')
        .addColumn('lowerBkgdColour', 'varchar(50)')
        .addForeignKeyConstraint('kformatKpiId_fk', ['kpiId'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kformatProviderId_fk', ['providerId'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('kformatUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('notification')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('isActive', 'boolean')
        .execute();

    await db.schema
        .createTable('userNotification')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('userId', 'text')
        .addColumn('notificationId', 'integer')
        .addForeignKeyConstraint('unotUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('unotNotificationId_fk', ['notificationId'], 'notification', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('page')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('userId', 'text')
        .addColumn('code', 'varchar(100)')
        .addColumn('title', 'varchar(100)')
        .addColumn('content', 'bytea')
        .addColumn('pageType', sql`"pageType"`)
        .addColumn('availableFrom', 'timestamp')
        .addColumn('changed', 'timestamp')
        .addColumn('created', 'timestamp')
        .addColumn('isActive', 'boolean')
        .addColumn('tags', 'varchar(1000)')
        .addForeignKeyConstraint('pgUserId_fk', ['userId'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createIndex('frameworkId_idx')
        .on('framework')
        .column('id')
        .execute();

    await db.schema
        .createIndex('validationOptionGpId_idx')
        .on('validationOptionGp')
        .column('id')
        .execute();

    await db.schema
        .createIndex('validationOptionId_idx')
        .on('validationOption')
        .column('id')
        .execute();

    await db.schema
        .createIndex('voVogId_idx')
        .on('validationOption')
        .column('validationOptionGpId')
        .execute();

    await db.schema
        .createIndex('elementId_idx')
        .on('element')
        .column('id')
        .execute();

    await db.schema
        .createIndex('elementFrameworkVog_idx')
        .on('element')
        .column('frameworkId')
        .column('validationOptionGpId')
        .execute();

    await db.schema
        .createIndex('providerId_idx')
        .on('provider')
        .column('id')
        .execute();

    await db.schema
        .createIndex('providerCode_idx')
        .on('provider')
        .column('code')
        .execute();

    await db.schema
        .createIndex('adminAreaCode_idx')
        .on('adminArea')
        .column('code')
        .execute();

    await db.schema
        .createIndex('adminAreaTypeIsActive_idx')
        .on('adminAarea')
        .column('type')
        .column('isActive')
        .execute();

    await db.schema
        .createIndex('submissionId_idx')
        .on('submission')
        .column('id')
        .execute();

    await db.schema
        .createIndex('submissionDtIsHProv_idx')
        .on('submission')
        .column('dateFrom')
        .column('isHidden')
        .column('providerId')
        .execute();

    await db.schema
        .createIndex('fileStubId_idx')
        .on('fileStub')
        .column('id')
        .execute();

    await db.schema
        .createIndex('fileStubSubmission_idx')
        .on('fileStub')
        .column('submissionId')
        .execute();

    await db.schema
        .createIndex('episodeId_idx')
        .on('episode')
        .column('episodeIdentifier')
        .execute();

    await db.schema
        .createIndex('episodeSubmission_idx')
        .on('episode')
        .column('submissionId')
        .execute();

    await db.schema
        .createIndex('attributeId_idx')
        .on('attribute')
        .column('id')
        .execute();

    await db.schema
        .createIndex('attributeSubmissionEpisode_idx')
        .on('attribute')
        .column('submissionId')
        .column('episodeIdentifier')
        .execute();

    await db.schema
        .createIndex('attributeSubmissionId_idx')
        .on('attribute')
        .column('submissionId')
        .execute()

    await db.schema
        .createIndex('attributeFileStubId_idx')
        .on('attribute')
        .column('fileStubId')
        .execute()

    await db.schema
        .createIndex('attributeErrorId_idx')
        .on('attributeError')
        .column('attributeId')
        .execute();

    await db.schema
        .createIndex('configurationId_idx')
        .on('configuration')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currencyId_idx')
        .on('currency')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currencyConfig_idx')
        .on('currency')
        .column('configurationId')
        .execute();

    await db.schema
        .createIndex('configurationCombSetId_idx')
        .on('configurationCombSet')
        .column('id')
        .execute();

    await db.schema
        .createIndex('configurationCombId_idx')
        .on('configurationComb')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participatingOrgsId_idx')
        .on('participatingOrgs')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participatingOrgsConfAdminArea_idx')
        .on('participatingOrgs')
        .column('configurationId')
        .column('adminAreaCode')
        .execute();

    await db.schema
        .createIndex('participatingOrgsConfProvider_idx')
        .on('participatingOrgs')
        .column('configurationId')
        .column('providerId')
        .execute();

    await db.schema
        .createIndex('currencyTriggerSetId_idx')
        .on('currencyTriggerSet')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currencyTriggerId_idx')
        .on('currencyTrigger')
        .column('id')
        .execute();

    await db.schema
        .createIndex('chargeId_idx')
        .on('charge')
        .column('id')
        .execute();

    await db.schema
        .createIndex('chargeSubmissionId_idx')
        .on('charge')
        .column('submissionId')
        .execute();

    await db.schema
        .createIndex('userSubscriptionId_idx')
        .on('userSubscription')
        .column('id')
        .execute();

    await db.schema
        .createIndex('reportRequestId_idx')
        .on('reportRequest')
        .column('id')
        .execute();

    await db.schema
        .createIndex('reportChunkId_idx')
        .on('reportChunk')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiId_idx')
        .on('kpi')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiSqlId_idx')
        .on('kpiSql')
        .column('kpiId')
        .execute();

    await db.schema
        .createIndex('kpiLibraryId_idx')
        .on('kpiLibrary')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiResultId_idx')
        .on('kpiResult')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpiFormatId_idx')
        .on('kpiFormat')
        .column('id')
        .execute();

    await db.schema
        .createIndex('notificationId_idx')
        .on('notification')
        .column('id')
        .execute();

    await db.schema
        .createIndex('userNotificationId_idx')
        .on('userNotification')
        .column('id')
        .execute();

    await db.schema
        .createIndex('pageId_idx')
        .on('page')
        .column('id')
        .execute();
}
/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
    
    await db.schema
        .dropIndex('frameworkId_idx').execute()
        .dropIndex('validationOptionGpId_idx').execute()
        .dropIndex('validationOptionId_idx').execute()
        .dropIndex('voVogId_idx').execute()
        .dropIndex('elementId_idx').execute()
        .dropIndex('elementFrameworkVog_idx').execute()
        .dropIndex('providerId_idx').execute()
        .dropIndex('providerCode_idx').execute()
        .dropIndex('adminAreaCode_idx').execute()
        .dropIndex('adminAreaTypeIsActive_idx').execute()
        .dropIndex('submissionId_idx').execute()
        .dropIndex('submissionDtIsHProv_idx').execute()
        .dropIndex('fileStubId_idx').execute()
        .dropIndex('fileStubSubmission_idx').execute()
        .dropIndex('episodeId_idx').execute()
        .dropIndex('episodeSubmission_idx').execute()
        .dropIndex('attributeId_idx').execute()
        .dropIndex('attributeSubmissionEpisode_idx').execute()
        .dropIndex('attributeSubmissionId_idx').execute()
        .dropIndex('attributeFileStubId_idx').execute()
        .dropIndex('attributeErrorId_idx').execute()
        .dropIndex('configurationId_idx').execute()
        .dropIndex('currencyId_idx').execute()
        .dropIndex('currencyConfig_idx').execute()
        .dropIndex('configurationCombSetId_idx').execute()
        .dropIndex('configurationCombId_idx').execute()
        .dropIndex('participatingOrgsId_idx').execute()
        .dropIndex('participatingOrgsConfAdminArea_idx').execute()
        .dropIndex('participatingOrgsConfProvider_idx').execute()
        .dropIndex('currencyTriggerSetId_idx').execute()
        .dropIndex('currencyTriggerId_idx').execute()
        .dropIndex('chargeId_idx').execute()
        .dropIndex('chargeSubmissionId_idx').execute()
        .dropIndex('userSubscriptionId_idx').execute()
        .dropIndex('reportRequestId_idx').execute()
        .dropIndex('reportChunkId_idx').execute()
        .dropIndex('kpiId_idx').execute()
        .dropIndex('kpiSqlId_idx').execute()
        .dropIndex('kpiLibraryId_idx').execute()
        .dropIndex('kpiResultId_idx').execute()
        .dropIndex('kpiFormatId_idx').execute()
        .dropIndex('notificationId_idx').execute()
        .dropIndex('userNotificationId_idx').execute()
        .dropIndex('pageId_idx').execute()
   
        .dropTable('page').execute()
        .dropTable('userNotification').execute()
        .dropTable('notification').execute()
        .dropTable('kpiFormat').execute()
        .dropTable('kpiResult').execute()
        .dropTable('kpiLibrary').execute()
        .dropTable('kpiSql').execute()
        .dropTable('kpi').execute()
        .dropTable('reportChunk').execute()
        .dropTable('reportRequest').execute()
        .dropTable('reportType').execute()
        .dropTable('userSubscription').execute()
        .dropTable('xeroLineItem').execute()
        .dropTable('contactQuote').execute()
        .dropTable('xeroQuote').execute()
        .dropTable('contactInvoice').execute()
        .dropTable('xeroInvoice').execute()
        .dropTable('contactXero').execute()
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
        .dropTable('fileStub').execute()
        .dropTable('submission').execute()
        .dropTable('processStatus').execute()
        .dropTable('provider').execute()
        .dropTable('adminArea').execute()
        .dropTable('element').execute()
        .dropTable('validationOption').execute()
        .dropTable('validationOptionGp').execute()
        .dropTable('framework').execute()

        await db.query(sql`
            DROP TYPE IF EXISTS 
                "role", 
                "adminAreaType", 
                "processStatusType", 
                "fileStubStatusType", 
                "pageType", 
                "currencyCrossChargeType", 
                "ifThenType"
        `)
}
