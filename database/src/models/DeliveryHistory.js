import mongoose from 'mongoose';

const deliveryHistorySchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    event: { type: String, required: true },
    notes: String,
    recordedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.DeliveryHistory ?? mongoose.model('DeliveryHistory', deliveryHistorySchema);
