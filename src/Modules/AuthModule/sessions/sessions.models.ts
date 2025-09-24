import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SessionViewModel = Omit<Session, 'expDate' | 'userId'>;

export class UserFromRefToken {
  userId: string;
  deviceId: string;
}

@Schema()
export class Session {
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
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;
