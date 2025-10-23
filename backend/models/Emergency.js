import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    emergencyType: {
      type: String,
      enum: ['breakdown', 'accident', 'theft', 'medical', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    resolvedDate: Date,
    status: {
      type: String,
      enum: ['reported', 'in-progress', 'resolved', 'closed'],
      default: 'reported',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    cost: Number,
    notes: String,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Emergency', emergencySchema);

