import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['oil_change', 'tire_replacement', 'maintenance', 'repair', 'inspection'],
      required: true,
    },
    description: String,
    cost: {
      type: Number,
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    nextServiceDate: Date,
    mileage: Number,
    provider: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: String,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);

