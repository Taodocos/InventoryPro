import mongoose, { Schema, Document } from 'mongoose';

export interface IIssuedItem extends Document {
  itemId: mongoose.Types.ObjectId;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  unitPrice?: number;
  issuedTo: string;
  issueDate: Date;
  purpose?: string;
  issuedBy: string;
  issuedByUserId?: string;
  approvedBy?: string;
  approvedByUserId?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalDate?: Date;
  rejectionReason?: string;
  warehouseLocation?: string;
  dateRecorded: Date;
  signature?: string;
  status: 'Active' | 'Returned' | 'Consumed';
  returnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IssuedItemSchema = new Schema<IIssuedItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    issuedQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number },
    issuedTo: { type: String, required: true },
    issueDate: { type: Date, required: true },
    purpose: { type: String },
    issuedBy: { type: String, required: true },
    issuedByUserId: { type: String },
    approvedBy: { type: String },
    approvedByUserId: { type: String },
    approvalStatus: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    warehouseLocation: { type: String },
    dateRecorded: { type: Date, default: Date.now },
    signature: { type: String },
    status: { 
      type: String, 
      enum: ['Active', 'Returned', 'Consumed'],
      default: 'Active'
    },
    returnDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.IssuedItem || mongoose.model<IIssuedItem>('IssuedItem', IssuedItemSchema);
