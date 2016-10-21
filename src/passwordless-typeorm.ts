import { Table, Column, PrimaryColumn } from 'typeorm';

@Table()
export class IPasswordlessTypeORM {
  @PrimaryColumn()
  uid: string;

  @Column()
  hashedToken: string;

  @Column()
  originUrl: string;

  @Column()
  ttl: number;
}
