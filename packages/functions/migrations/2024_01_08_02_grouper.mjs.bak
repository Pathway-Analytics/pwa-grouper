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
    .createType('admin_area_type')
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
    .createType('process_status_type')
    .asEnum([
        'Submission',
        'Sandbox',
        'Validation',
        'Report'
    ])
    .execute();
    
    await db.schema
    .createType('file_stub_status_type')
    .asEnum([
        'NEW',
        'PROCESSING',
        'PROCESSED',
        'ERROR'
    ])
    .execute();
    
    await db.schema
    .createType('page_type')
    .asEnum([
        'HELP',
        'UPDATE',
        'PAGE'
    ])
    .execute();

    await db.schema
    .createType('currency_cross_charge_type')
    .asEnum([
        'NONE',
        'FULL',
        'LOCAL LIMITED', 
        'LOCAL UNLIMITED'
    ])
    .execute();
    
    await db.schema
    .createType('if_then_type')
    .asEnum([
        'IF',
        'THEN',
    ])
    .execute();
    
    await db.schema
        .createTable('framework')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .addColumn('last_changed_by', 'text')
        .addForeignKeyConstraint(
            'fmwk_last_changed_by_fk', ['last_changed_by'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('validation_option_gp')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .execute();

    await db.schema
        .createTable('validation_option')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('validation_option_gp_id', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(225)', (col) => col.notNull())
        .addColumn('description', 'varchar(2000)')
        .addColumn('code', 'varchar(50)')
        .addColumn('is_local', 'boolean')
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .addColumn('alt_option', 'integer')
        .addForeignKeyConstraint('vo_vog_id_fk', ['validation_option_gp_id'], 'validation_option_gp', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('vo_alt_option_fk', ['alt_option'], 'validation_option', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('element')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('framework_id', 'integer', (col) => col.notNull())
        .addColumn('validation_option_gp_id', 'integer')
        .addColumn('field_name', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('mask', 'varchar(50)')
        .addColumn('regexp', 'varchar(100)')
        .addColumn('is_mandatory', 'boolean')
        .addColumn('is_date', 'boolean')
        .addColumn('is_clinic_list', 'boolean')
        .addColumn('is_episode_identifier', 'boolean')
        .addColumn('is_lsoa', 'boolean')
        .addColumn('order', 'integer')
        .addColumn('alt_names', 'varchar(2000)')
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .addForeignKeyConstraint('elem_framework_id_fk', ['framework_id'], 'framework', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('elem_vog_id_fk', ['validation_option_gp_id'], 'validation_option_gp', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('admin_area')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(200)')
        .addColumn('code', 'varchar(10)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('is_active', 'boolean')
        .addColumn('type', sql`admin_area_type`)
        .addColumn('parent_id', 'integer')
        .addColumn('last_changed', 'timestamp')
        .addForeignKeyConstraint('admarea_parent_id_fk', ['parent_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('provider')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('parent_admin_area_id', 'integer')
        .addColumn('name', 'varchar(200)')
        .addColumn('code', 'varchar(10)')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(9,6)')
        .addColumn('lng', 'decimal(9,6)')
        .addColumn('is_active', 'boolean')
        .addForeignKeyConstraint('prov_parent_admin_area_id_fk', ['parent_admin_area_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('process_status')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('label', 'varchar(50)')
        .addColumn('description', 'varchar(500)')
        .addColumn('order', 'integer')
        .addColumn('type', sql`process_status_type`)
        .addColumn('is_active', 'boolean')
        .execute();
        
    await db.schema
        .createTable('submission')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('provider_id', 'integer', (col) => col.notNull())
        .addColumn('process_status_id', 'integer') 
        .addColumn('date_from', 'date')
        .addColumn('is_hidden', 'boolean')
        .addColumn('total_tariff', 'decimal(6,2)')
        .addColumn('episodes', 'integer')
        .addColumn('records', 'integer')
        .addColumn('last_changed', 'timestamp')
        .addColumn('last_changed_by', 'text')
        .addForeignKeyConstraint('subm_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('subm_last_changed_by_fk', ['last_changed_by'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('subm_process_status_fk', ['process_status_id'], 'process_status', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('file_stub')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('file_name', 'varchar(200)')
        .addColumn('file_size', 'integer')
        .addColumn('clinic_list', 'varchar(500)')
        .addColumn('uploaded_date', 'timestamp')
        .addColumn('uploaded_by', 'text')
        .addColumn('file_url', 'text')
        .addColumn('status', sql`file_stub_status_type`)
        .addForeignKeyConstraint('filestb_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('filestb_uploaded_by_fk', ['uploaded_by'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('episode')
        .addColumn('episode_identifier', 'varchar(100)', (col) => col.primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('provider_code', 'varchar(50)')
        .addColumn('site_code', 'varchar(50)')
        .addColumn('patient', 'varchar(50)')
        .addColumn('attendance_date', 'date')
        .addColumn('lsoa', 'varchar(50)')
        .addForeignKeyConstraint('epi_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attribute')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('file_stub_id', 'integer', (col) => col.notNull())
        .addColumn('element_id', 'integer', (col) => col.notNull())
        .addColumn('episode_identifier', 'varchar(100)')
        .addColumn('record', 'varchar(50)')
        .addColumn('value', 'varchar(50)')
        .addColumn('date_value', 'date')
        .addForeignKeyConstraint('att_episode_identifier_fk', ['episode_identifier'], 'episode', ['episode_identifier'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('att_submission_id_fk', ['submission_id'], 'submission', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('att_file_stub_id_fk', ['file_stub_id'], 'file_stub', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('att_element_id_fk', ['element_id'], 'element', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('attribute_error')
        .addColumn('attribute_id', 'integer', (col) => col.primaryKey())
        .addColumn('error', 'varchar(500)')
        .addForeignKeyConstraint('att_err_attribute_id_fk', ['attribute_id'], 'attribute', ['id'], 
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configuration')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('start_date', 'date')
        .addColumn('end_date', 'date')
        .addColumn('user_id', 'text', (col) => col.notNull())
        .addColumn('submit_within', 'integer')
        .addColumn('is_hide_rates', 'boolean')
        .addForeignKeyConstraint('config_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('currency')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addColumn('name', 'varchar(100)')
        .addColumn('name_short', 'varchar(10)')
        .addColumn('primary_tariff', 'decimal(6,2)')
        .addColumn('additionalTariff', 'decimal(6,2)')
        .addColumn('cross_charge_type', sql`currency_cross_charge_type`)
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .addForeignKeyConstraint('curr_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configuration_comb_set')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addForeignKeyConstraint('confccs_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('configuration_comb')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configuration_comb_set_id', 'integer', (col) => col.notNull())
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('role', sql`if_then_type`)
        .addForeignKeyConstraint('configcc_configuration_comb_set_id_fk', ['configuration_comb_set_id'], 'configuration_comb_set', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('configcc_currency_id_fk', ['currency_id'], 'currency', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('participating_orgs')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('configuration_id', 'integer', (col) => col.notNull())
        .addColumn('admin_area_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('factor', 'decimal(6,5)')
        .addForeignKeyConstraint('partorg_configuration_id_fk', ['configuration_id'], 'configuration', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('partorg_admin_area_id_fk', ['admin_area_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('part_org_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('currency_trigger_set')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('description', 'varchar(200)')
        .addColumn('last_changed', 'timestamp')
        .addForeignKeyConstraint('currts_currency_id_fk', ['currency_id'], 'currency', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('currency_trigger')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('currency_trigger_set_id', 'integer', (col) => col.notNull())
        .addColumn('validation_option_id', 'integer', (col) => col.notNull())
        .addColumn('is_not', 'boolean')
        .addForeignKeyConstraint('currt_currency_trigger_set_id_fk', ['currency_trigger_set_id'], 'currency_trigger_set', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('currt_validation_option_id_fk', ['validation_option_id'], 'validation_option', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('charge')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('submission_id', 'integer', (col) => col.notNull())
        .addColumn('episode_identifier', 'varchar(100)')
        .addColumn('currency_id', 'integer', (col) => col.notNull())
        .addColumn('provider_id', 'integer', (col) => col.notNull())
        .addColumn('commissioner_id', 'integer', (col) => col.notNull())
        .addColumn('primary_tariff', 'decimal(6,2)')
        .addColumn('additional_tariff', 'decimal(6,2)')
        .addForeignKeyConstraint('charge_episode_identifier', ['episode_identifier'], 'episode', ['episode_identifier'],
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
        .addForeignKeyConstraint('charge_commissioner_id_fk', ['commissioner_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('clinic')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('code', 'varchar(50)')
        .addColumn('provider_id', 'integer')
        .addColumn('commissioner_id', 'integer')
        .addColumn('address', 'varchar(500)')
        .addColumn('lat', 'decimal(10,8)')
        .addColumn('lng', 'decimal(10,8)')
        .addForeignKeyConstraint('clinic_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .addForeignKeyConstraint('clinic_commissioner_id_fk', ['commissioner_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('contact_xero')
        .addColumn('xero_contact_id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('link_to_provider_id', 'integer')
        .addColumn('link_to_admin_area_id', 'integer')
        .addForeignKeyConstraint('contx_link_to_provider_id_fk', ['link_to_provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .addForeignKeyConstraint('contx_link_to_admin_area_id_fk', ['link_to_admin_area_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('set null')
        )
        .execute();

    await db.schema
        .createTable('xero_invoice')
        .addColumn('id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('type', 'varchar(50)')
        .addColumn('invoice_no', 'varchar(50)')
        .addColumn('reference', 'varchar(50)')
        .addColumn('amount_due', 'decimal(9,2)')
        .addColumn('amount_paid', 'decimal(9,2)')
        .addColumn('amount_credited', 'decimal(9,2)')
        .addColumn('currency_rate', 'decimal(9,4)')        
        .addColumn('has_errors', 'boolean')
        .addColumn('is_discounted', 'boolean')
        .addColumn('date_string', 'date')
        .addColumn('due_date_string', 'date')
        .addColumn('branding_theme', 'varchar(50)')
        .addColumn('url', 'varchar(500)')
        .addColumn('status', 'varchar(50)')
        .addColumn('line_amount_types', 'varchar(500)')
        .addColumn('sub_total', 'decimal(9,2)')
        .addColumn('total_tax', 'decimal(9,2)')
        .addColumn('total', 'decimal(9,2)')
        .addColumn('currency_code', 'varchar(50)')
        .addColumn('sent_to_contact', 'boolean')
        .addColumn('expected_payment_date', 'date')
        .addColumn('planned_payment_date', 'date')
        .addColumn('total_discount', 'decimal(9,2)')
        .addColumn('fully_paid_on_date', 'date')
        .addColumn('updated_utc', 'timestamp')
        .execute();

    await db.schema
        .createTable('contact_invoice')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('xero_invoice_id', 'integer')
        .addColumn('xero_contact_id', 'integer')
        .execute();
    
    await db.schema 
        .createTable('xero_quote')
        .addColumn('id', 'varchar(50)', (col) => col.primaryKey())
        .addColumn('type', 'varchar(50)')
        .addColumn('quote_no', 'varchar(50)')
        .addColumn('reference', 'varchar(50)')
        .addColumn('currency_rate', 'decimal(9,2)')
        .addColumn('has_errors', 'boolean')
        .addColumn('is_discounted', 'boolean')
        .addColumn('has_attachements', 'boolean')
        .addColumn('date_string', 'date')
        .addColumn('branding_theme', 'varchar(50)')
        .addColumn('url', 'varchar(500)')
        .addColumn('status', 'varchar(50)')
        .addColumn('line_amount_types', 'varchar(500)')
        .addColumn('sub_total', 'decimal(9,2)')
        .addColumn('total_tax', 'decimal(9,2)')
        .addColumn('total', 'decimal(9,2)')
        .addColumn('currency_code', 'varchar(50)')
        .addColumn('sent_to_contact', 'boolean')
        .addColumn('total-discount', 'decimal(9,2)')
        .addColumn('updated_utc', 'timestamp')
        .execute();

    await db.schema
        .createTable('contact_quote')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('xero_quote_id', 'integer')
        .addColumn('xero_contact_id', 'integer')
        .execute();

    await db.schema
        .createTable('xero_line_item')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('line_item_id', 'varchar(50)')
        .addColumn('xero_invoice_id', 'integer')
        .addColumn('xero_quote_id', 'integer')
        .addColumn('description', 'varchar(2000)')
        .addColumn('quantity', 'decimal(9,2)')
        .addColumn('unit_amount', 'decimal(9,2)')
        .addColumn('item_code', 'varchar(50)')
        .addColumn('account_code', 'varchar(50)')
        .addColumn('tax_type', 'varchar(50)')
        .addColumn('tax_amount', 'decimal(9,2)')
        .addColumn('line_amount', 'decimal(9,2)')
        .addColumn('discount_rate', 'decimal(9,2)')
        .execute();

    await db.schema
        .createTable('user_subscription')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('role', sql`role`)
        .addColumn('xero_invoice_id', 'varchar(50)')
        .addColumn('renewal_invoice_id', 'varchar(50)')
        .addColumn('renewal_quote_id', 'varchar(50)')
        .addColumn('user_id', 'text')
        .addColumn('provider_id', 'integer')
        .addColumn('admin_area_id', 'integer')
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .addColumn('invoice_no', 'varchar(50)')
        .addColumn('start_date','date')
        .addColumn('end_date','date')
        .addForeignKeyConstraint('usub_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usub_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('usub_admin_area_id_fk', ['admin_area_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();    

    await db.schema
        .createTable('report_type')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(50)')
        .addColumn('name_button', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('is_active', 'boolean')
        .addColumn('last_changed', 'timestamp')
        .execute();

    await db.schema
        .createTable('report_request')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('report_type_id', 'integer')
        .addColumn('user_id', 'text')
        .addColumn('process_status_id', 'integer')
        .addColumn('decription', 'varchar(2000)')
        .addColumn('start_from', 'date')
        .addColumn('period', 'integer')
        .addColumn('is_email', 'boolean')
        .addColumn('csv_providers', 'varchar(250)')
        .addColumn('csv_commissioners', 'varchar(250)')
        .addColumn('request_profile', sql`role`)
        .addColumn('guid', 'varchar(50)')
        .addColumn('file_name', 'varchar(50)')
        .addColumn('file_url', 'text')        
        .addColumn('file_size', 'integer')
        .addColumn('error', 'varchar(200)')
        .addColumn('created', 'timestamp')
        .addColumn('last_changed', 'timestamp')
        .addColumn('report_request_json', 'varchar(2000)')
        .addForeignKeyConstraint('repreq_report_type_id_fk', ['report_type_id'], 'report_type', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreq_user_id_fk', ['user_id'], 'users', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repreq_process_status_fk', ['process_status_id'], 'process_status', ['id'],
            (cb) => cb.onDelete('restrict')
        )
        .execute();

    await db.schema
        .createTable('report_chunk')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('report_request_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('commissioner_id', 'integer')
        .addColumn('date_from', 'date')
        .addForeignKeyConstraint('repchk_report_request_id_fk', ['report_request_id'], 'report_request', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchk_provider_id_fk', ['provider_id'], 'provider', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addForeignKeyConstraint('repchk_commissioner_id_fk', ['commissioner_id'], 'admin_area', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .execute();

    await db.schema
        .createTable('kpi')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(50)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('is_active', 'boolean')
        .addColumn('uom', 'varchar(50)')
        .addColumn('numerator', 'varchar(1000)')
        .addColumn('denominator', 'varchar(1000)')
        .addColumn('serial', 'varchar(50)')
        .addColumn('last_changed', 'timestamp')
        .execute();

    await db.schema
        .createTable('kpi_sql')
        .addColumn('kpi_id', 'integer')
        .addColumn('sql', 'bytea')
        .addForeignKeyConstraint('ksql_kpi_id_fk', ['kpi_id'], 'kpi', ['id'],
            (cb) => cb.onDelete('cascade')
        )
        .addPrimaryKeyConstraint('kpi_sql_id_pk', ['kpi_id'])
        .execute();

    await db.schema
        .createTable('kpi_library')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'text')
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
        .createTable('kpi_result')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('kpi_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('submission_id', 'integer')
        .addColumn('numerator', 'varchar(50)')
        .addColumn('denominator', 'varchar(50)')
        .addColumn('uom', 'varchar(50)')
        .addColumn('created', 'timestamp')
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
        .createTable('kpi_format')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('kpi_id', 'integer')
        .addColumn('provider_id', 'integer')
        .addColumn('user_id', 'text')
        .addColumn('upper_value', 'decimal(6,2)')
        .addColumn('lower_value', 'decimal(6,2)')
        .addColumn('upper_txt_colour', 'varchar(50)')
        .addColumn('mid_txt_colour', 'varchar(50)')
        .addColumn('lower_txt_colour', 'varchar(50)')
        .addColumn('upper_bkgd_colour', 'varchar(50)')
        .addColumn('mid_bkgd_colour', 'varchar(50)')
        .addColumn('lower_bkgd_colour', 'varchar(50)')
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
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(100)')
        .addColumn('description', 'varchar(2000)')
        .addColumn('is_active', 'boolean')
        .execute();

    await db.schema
        .createTable('user_notification')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'text')
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
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('user_id', 'text')
        .addColumn('code', 'varchar(100)')
        .addColumn('title', 'varchar(100)')
        .addColumn('content', 'bytea')
        .addColumn('page_type', sql`page_type`)
        .addColumn('available_from', 'timestamp')
        .addColumn('changed', 'timestamp')
        .addColumn('created', 'timestamp')
        .addColumn('is_active', 'boolean')
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
        .createIndex('validation_option_gp_id_idx')
        .on('validation_option_gp')
        .column('id')
        .execute();

    await db.schema
        .createIndex('validation_option_id_idx')
        .on('validation_option')
        .column('id')
        .execute();

    await db.schema
        .createIndex('vo_vog_id_idx')
        .on('validation_option')
        .column('validation_option_gp_id')
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
        .column('validation_option_gp_id')
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
        .createIndex('admin_area_id_idx')
        .on('admin_area')
        .column('id')
        .execute();

    await db.schema
        .createIndex('admin_area_type_is_active_idx')
        .on('admin_area')
        .column('type')
        .column('is_active')
        .execute();

    await db.schema
        .createIndex('submission_id_idx')
        .on('submission')
        .column('id')
        .execute();

    await db.schema
        .createIndex('submission_dt_isH_prov_idx')
        .on('submission')
        .column('date_from')
        .column('is_hidden')
        .column('provider_id')
        .execute();

    await db.schema
        .createIndex('file_stub_id_idx')
        .on('file_stub')
        .column('id')
        .execute();

    await db.schema
        .createIndex('file_stub_submission_idx')
        .on('file_stub')
        .column('submission_id')
        .execute();

    await db.schema
        .createIndex('episode_id_idx')
        .on('episode')
        .column('episode_identifier')
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
        .column('episode_identifier')
        .execute();

    await db.schema
        .createIndex('attribute_submission_id_idx')
        .on('attribute')
        .column('submission_id')
        .execute()

    await db.schema
        .createIndex('attribute_file_stub_id_idx')
        .on('attribute')
        .column('file_stub_id')
        .execute()

    await db.schema
        .createIndex('attributeError_id_idx')
        .on('attribute_error')
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
        .createIndex('configuration_comb_set_id_idx')
        .on('configuration_comb_set')
        .column('id')
        .execute();

    await db.schema
        .createIndex('configuration_comb_id_idx')
        .on('configuration_comb')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participating_orgs_id_idx')
        .on('participating_orgs')
        .column('id')
        .execute();

    await db.schema
        .createIndex('participating_orgs_conf_admin_area_idx')
        .on('participating_orgs')
        .column('configuration_id')
        .column('admin_area_id')
        .execute();

    await db.schema
        .createIndex('participating_orgs_conf_provider_idx')
        .on('participating_orgs')
        .column('configuration_id')
        .column('provider_id')
        .execute();

    await db.schema
        .createIndex('currency_trigger_set_id_idx')
        .on('currency_trigger_set')
        .column('id')
        .execute();

    await db.schema
        .createIndex('currency_trigger_id_idx')
        .on('currency_trigger')
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
        .createIndex('user_subscription_id_idx')
        .on('user_subscription')
        .column('id')
        .execute();

    await db.schema
        .createIndex('report_request_id_idx')
        .on('report_request')
        .column('id')
        .execute();

    await db.schema
        .createIndex('report_chunk_id_idx')
        .on('report_chunk')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpi_id_idx')
        .on('kpi')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpi_sql_id_idx')
        .on('kpi_sql')
        .column('kpi_id')
        .execute();

    await db.schema
        .createIndex('kpi_library_id_idx')
        .on('kpi_library')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpi_result_id_idx')
        .on('kpi_result')
        .column('id')
        .execute();

    await db.schema
        .createIndex('kpi_format_id_idx')
        .on('kpi_format')
        .column('id')
        .execute();

    await db.schema
        .createIndex('notification_id_idx')
        .on('notification')
        .column('id')
        .execute();

    await db.schema
        .createIndex('user_notification_id_idx')
        .on('user_notification')
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
        .dropIndex('validation_option_gp_id_idx').execute()
        .dropIndex('validation_option_id_idx').execute()
        .dropIndex('vo_vog_id_idx').execute()
        .dropIndex('element_id_idx').execute()
        .dropIndex('element_framework_vog_idx').execute()
        .dropIndex('provider_id_idx').execute()
        .dropIndex('provider_code_idx').execute()
        .dropIndex('admin_area_id_idx').execute()
        .dropIndex('admin_area_type_isactive_idx').execute()
        .dropIndex('submission_id_idx').execute()
        .dropIndex('submission_dt_isH_prov_idx').execute()
        .dropIndex('file_stub_id_idx').execute()
        .dropIndex('file_stub_submission_idx').execute()
        .dropIndex('episode_id_idx').execute()
        .dropIndex('episode_submission_idx').execute()
        .dropIndex('attribute_id_idx').execute()
        .dropIndex('attribute_submission_episode_idx').execute()
        .dropIndex('attribute_submission_id_idx').execute()
        .dropIndex('attribute_file_stub_id_idx').execute()
        .dropIndex('attribute_error_id_idx').execute()
        .dropIndex('configuration_id_idx').execute()
        .dropIndex('currency_id_idx').execute()
        .dropIndex('currency_config_idx').execute()
        .dropIndex('configuration_comb_set_id_idx').execute()
        .dropIndex('configuration_comb_id_idx').execute()
        .dropIndex('participating_orgs_id_idx').execute()
        .dropIndex('participating_orgs_conf_adminarea_idx').execute()
        .dropIndex('participating_orgs_conf_provider_idx').execute()
        .dropIndex('currency_trigger_set_id_idx').execute()
        .dropIndex('currency_trigger_id_idx').execute()
        .dropIndex('charge_id_idx').execute()
        .dropIndex('charge_submission_id_idx').execute()
        .dropIndex('user_subscription_id_idx').execute()
        .dropIndex('report_request_id_idx').execute()
        .dropIndex('report_chunk_id_idx').execute()
        .dropIndex('kpi_id_idx').execute()
        .dropIndex('kpi_sql_id_idx').execute()
        .dropIndex('kpi_library_id_idx').execute()
        .dropIndex('kpi_result_id_idx').execute()
        .dropIndex('kpi_format_id_idx').execute()
        .dropIndex('notification_id_idx').execute()
        .dropIndex('user_notification_id_idx').execute()
        .dropIndex('page_id_idx').execute()
   
        .dropTable('page').execute()
        .dropTable('user_notification').execute()
        .dropTable('notification').execute()
        .dropTable('kpi_format').execute()
        .dropTable('kpi_result').execute()
        .dropTable('kpi_library').execute()
        .dropTable('kpi_sql').execute()
        .dropTable('kpi').execute()
        .dropTable('report_chunk').execute()
        .dropTable('report_request').execute()
        .dropTable('report_type').execute()
        .dropTable('user_subscription').execute()
        .dropTable('xero_line_item').execute()
        .dropTable('contact_quote').execute()
        .dropTable('xero_quote').execute()
        .dropTable('contact_invoice').execute()
        .dropTable('xero_invoice').execute()
        .dropTable('contact_xero').execute()
        .dropTable('clinic').execute()
        .dropTable('charge').execute()
        .dropTable('currency_trigger').execute()
        .dropTable('currency_trigger_set').execute()
        .dropTable('participating_orgs').execute()
        .dropTable('configuration_comb').execute()
        .dropTable('configuration_comb_set').execute()
        .dropTable('currency').execute()
        .dropTable('configuration').execute()
        .dropTable('attribute_error').execute()
        .dropTable('attribute').execute()
        .dropTable('episode').execute()
        .dropTable('file_stub').execute()
        .dropTable('submission').execute()
        .dropTable('process_status').execute()
        .dropTable('provider').execute()
        .dropTable('admin_area').execute()
        .dropTable('element').execute()
        .dropTable('validation_option').execute()
        .dropTable('validation_option_gp').execute()
        .dropTable('framework').execute()

        await db.query(sql`
            DROP TYPE IF EXISTS 
                "role", 
                "admin_area_type", 
                "process_status_type", 
                "file_stub_status_type", 
                "page_type", 
                "currency_cross_charge_type", 
                "if_then_type"
        `)
}
