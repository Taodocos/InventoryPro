import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  itemId: string;
  itemName: string;
  category: string;
  description?: string;
  quantity: number;
  unitMeasurement: string;
  unitPrice: number;
  totalPrice: number;
  recordedBy: string;
  recordedByUserId?: string;
  supplierName?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  totalPurchaseCost?: number;
  warehouseName?: string;
  locationCode?: string;
  expiryDate?: Date;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    itemId: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    unitMeasurement: { type: String, default: 'Piece' },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true },
    recordedBy: { type: String, required: true },
    recordedByUserId: { type: String },
    supplierName: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    totalPurchaseCost: { type: Number },
    warehouseName: { type: String },
    locationCode: { type: String },
    expiryDate: { type: Date },
    status: { 
      type: String, 
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    },
  },
  { timestamps: true }
);

// Auto-update status based on quantity
ItemSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= 5) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
