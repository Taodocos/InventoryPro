import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  itemId: string;
  itemName: string;
  category: string;
  requestedQuantity: number;
  requestedBy: string;
  requestedByUserId: string;
  department: string;
  numberOfPatients?: number;
  useFor: string;
  location: string;
  status: 'Unseen' | 'Seen' | 'Approved' | 'Rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    requestedQuantity: { type: Number, required: true, min: 1 },
    requestedBy: { type: String, required: true },
    requestedByUserId: { type: String, required: true },
    department: { type: String, required: true },
    numberOfPatients: { type: Number },
    useFor: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['Unseen', 'Seen', 'Approved', 'Rejected'],
      default: 'Unseen'
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);
