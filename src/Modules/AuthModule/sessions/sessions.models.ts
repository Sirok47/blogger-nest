import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserPSQL } from '../users/users.models';

export type SessionViewModel = Omit<Session, 'expDate' | 'userId'>;

export class UserFromRefToken {
  userId: string;
  deviceId: string;
}

export interface Session {
  ip: string;
  title: string;
  lastActiveDate: Date;
  expDate: Date;
  deviceId: string;
  userId: string;
}

@Schema()
export class SessionMongo implements Session {
  @Prop({ type: String, required: true, maxlength: 20 })
  ip: string;

  @Prop({ type: String, required: true, maxlength: 150 })
  title: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Date, required: true, index: { expires: 0 } })
  expDate: Date;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true, minlength: 1 })
  userId: string;

  static CreateDocument(session: Session): Session {
    const doc = new this();
    doc.ip = session.ip;
    doc.title = session.title;
    doc.lastActiveDate = session.lastActiveDate;
    doc.expDate = session.expDate;
    doc.deviceId = session.deviceId;
    doc.userId = session.userId;
    return doc;
  }
}

export const SessionSchema = SchemaFactory.createForClass(SessionMongo);
SessionSchema.loadClass(SessionMongo);

export type SessionDocument = HydratedDocument<SessionMongo>;
export type SessionModelType = Model<SessionDocument> & typeof SessionMongo;

@Entity({ name: 'Sessions' })
export class SessionPSQL implements Session {
  @Column('varchar', { length: 20 })
  ip: string;

  @Column('varchar', { length: 150 })
  title: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  lastActiveDate: Date;

  @Column('timestamp with time zone')
  expDate: Date;

  @PrimaryColumn('uuid')
  deviceId: string;

  @ManyToOne(() => UserPSQL, (user) => user.sessions)
  user: UserPSQL;
  @Column()
  userId: string;

  static CreateDocument(session: Session): SessionPSQL {
    const doc = new this();
    doc.ip = session.ip;
    doc.title = session.title;
    doc.lastActiveDate = session.lastActiveDate;
    doc.expDate = session.expDate;
    doc.deviceId = session.deviceId;
    doc.user = new UserPSQL();
    doc.user.id = session.userId;
    doc.userId = session.userId;
    return doc;
  }
}
