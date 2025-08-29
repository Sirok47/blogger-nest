import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SessionViewModel = Omit<Session, 'expDate' | 'userId'>;

@Schema()
export class Session {
  @Prop({ type: String, required: true, maxlength: 20 })
  ip: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  title: string;

  @Prop({ type: String, required: true })
  lastActiveDate: string;

  @Prop({ type: Date, required: true })
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
