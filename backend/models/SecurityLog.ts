import mongoose, { Document, Schema, Model } from 'mongoose';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'BRUTE_FORCE_TRIGGERED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_IP_DETECTED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'LOGOUT';

export type SecurityEventStatus = 'SUCCESS' | 'FAILED' | 'WARNING' | 'BLOCKED';

export interface ISecurityLog extends Document {
  user: string; // User email or identifier; never contains credentials
  eventType: SecurityEventType;
  status: SecurityEventStatus;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  attemptCount?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    user: {
      type: String,
      required: [true, 'User identifier is required'],
      trim: true,
      index: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'BRUTE_FORCE_TRIGGERED',
        'ACCOUNT_LOCKED',
        'SUSPICIOUS_IP_DETECTED',
        'PASSWORD_RESET_REQUESTED',
        'LOGOUT',
      ],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Event status is required'],
      enum: ['SUCCESS', 'FAILED', 'WARNING', 'BLOCKED'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 500,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown Client',
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
  }
);

// Never store passwords or secrets inside security logs
SecurityLogSchema.pre('save', function (this: any) {
  if (this.metadata && (this.metadata.password || this.metadata.token || this.metadata.secret)) {
    delete this.metadata.password;
    delete this.metadata.token;
    delete this.metadata.secret;
  }
});

export const SecurityLog: Model<ISecurityLog> =
  mongoose.models.SecurityLog || mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);

export default SecurityLog;
