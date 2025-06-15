import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User'; // Assuming User model is in User.ts

export interface IContact extends Document {
  name: string;
  phoneNumber: string;
  invitationSent: boolean;
  invitationToken?: string; // Optional, generated when sending invitation
  guestUser?: IUser['_id']; // Reference to User ID (guest)
}

const ContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  invitationSent: { type: Boolean, default: false },
  invitationToken: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls but unique values otherwise
  guestUser: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
