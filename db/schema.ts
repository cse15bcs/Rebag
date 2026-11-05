import {sqliteTable,text,integer,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const designApprovals=sqliteTable('design_approvals',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),draftId:text('draft_id').notNull(),version:integer('version').notNull(),
 idempotencyKey:text('idempotency_key').notNull(),payloadJson:text('payload_json').notNull(),designHash:text('design_hash').notNull(),fingerprint:text('fingerprint').notNull(),
 referenceKey:text('reference_key'),referenceType:text('reference_type'),referenceHash:text('reference_hash'),fabricKey:text('fabric_key'),fabricType:text('fabric_type'),fabricHash:text('fabric_hash'),
 approvedName:text('approved_name').notNull(),approvalTextVersion:text('approval_text_version').notNull(),approvalText:text('approval_text').notNull().default('I approve the shape, requested dimensions, layout and personal details shown in this design version. I understand that a maker must still confirm fabric suitability, construction, the final quote and separate permission to cut any treasured fabric.'),createdAt:text('created_at').notNull(),
},t=>({
 ownerRequest:uniqueIndex('design_approval_owner_request').on(t.ownerId,t.idempotencyKey),
 ownerVersion:uniqueIndex('design_approval_owner_version').on(t.ownerId,t.draftId,t.version),
 ownerCreated:index('design_approval_owner_created').on(t.ownerId,t.createdAt),
}));
