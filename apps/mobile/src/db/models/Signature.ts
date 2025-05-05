/**
 * Signature model for WatermelonDB
 */
import { Model } from '@watermelondb/core';
import { field, date, readonly } from '@watermelondb/decorators';

export default class Signature extends Model {
  static table = 'signatures';

  @field('reference_id') referenceId!: string;
  @field('reference_type') referenceType!: string;
  @field('signer_name') signerName!: string;
  @field('signature_uri') signatureUri!: string;
  @readonly @date('created_at') createdAt!: Date;
  @field('is_uploaded') isUploaded!: boolean;
  @field('upload_error') uploadError?: string;
}
