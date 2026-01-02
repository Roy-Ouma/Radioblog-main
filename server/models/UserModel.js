import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      index: true,
      default: () => `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    },
    password: {
      type: String,
      select: false,
      default: null,
      // Deprecated: password field kept for backward compatibility.
      // All authentication now uses Google OAuth only.
    },
    image: {
      type: String,
      default: "",
    },
    accountType: {
      type: String,
      enum: ["User", "Writer", "Admin"],
      default: "User",
    },
    provider: {
      type: String,
      enum: ["google"],
      default: "google",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Follower",
      },
    ],
    isGeneralAdmin: {
      type: Boolean,
      default: false,
    },
    // whether the user is allowed to create/publish posts
    canPost: {
      type: Boolean,
      default: true,
    },
    // Profile customization for writers (optional overrides for Google defaults)
    author_name: {
      type: String,
      default: null,
      trim: true,
      maxlength: 120,
    },
    author_avatar_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  const doc = this.toObject({ getters: true, virtuals: false });
  delete doc.password;
  return doc;
};

// Enforce that all users use Google OAuth only
userSchema.pre('save', function (next) {
  try {
    if (this.provider !== 'google') {
      this.provider = 'google';
    }
    // Google OAuth users are always verified
    if (this.provider === 'google') {
      this.emailVerified = true;
    }
  } catch (e) {
    // ignore
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;


