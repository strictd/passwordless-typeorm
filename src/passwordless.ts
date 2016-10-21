import { Table, Column, PrimaryColumn } from 'typeorm';

@Table()
export class Passwordless {
  @PrimaryColumn('string')
  uid: string;

  @Column('string', {type: 'string', nullable: false, default: ''})
  hashedToken: string;

  @Column('text', {type: 'text', default: ''})
  originUrl: string;

  @Column('bigint', {type: 'bigint', default: 0})
  ttl: number;
}
