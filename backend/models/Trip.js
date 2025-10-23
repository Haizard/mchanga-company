import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    startLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    endLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    distance: Number,
    fuelUsed: Number,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    fare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial'],
      default: 'pending',
    },
    notes: String,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);

