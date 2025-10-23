import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      required: true,
    },
    quantityAdded: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    fuelDate: {
      type: Date,
      default: Date.now,
    },
    mileage: Number,
    provider: String,
    notes: String,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Fuel', fuelSchema);

