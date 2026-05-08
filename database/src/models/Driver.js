import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    vehicle: { type: String, required: true },
    status: { type: String, default: 'active' },
    location: { type: [Number], required: true },
    route: { type: [[Number]], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Driver ?? mongoose.model('Driver', driverSchema);
