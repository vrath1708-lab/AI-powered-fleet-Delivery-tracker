import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    customer: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    deliveryPoint: { type: [Number], required: true },
    statusLog: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Order ?? mongoose.model('Order', orderSchema);
