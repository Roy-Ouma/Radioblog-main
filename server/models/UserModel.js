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
      enum: ["credentials", "google"],
      default: "credentials",
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

// Enforce that credential-based accounts are not marked verified accidentally.
userSchema.pre('save', function (next) {
  try {
    if (this.provider === 'credentials') {
      this.emailVerified = false;
    }
  } catch (e) {
    // ignore
  }
  next();
});

// When using findOneAndUpdate, ensure updates do not set emailVerified=true for credentials
userSchema.pre('findOneAndUpdate', function (next) {
  try {
    const update = this.getUpdate() || {};
    // If the update sets emailVerified to true, and provider is credentials (either in query or update), block it
    const set = update.$set || update;
    const providerInUpdate = (set.provider || (update.$set && update.$set.provider)) || null;
    const emailVerifiedInUpdate = set.emailVerified === true || (update.$set && update.$set.emailVerified === true);
    // if provider is explicitly set to credentials, force emailVerified false
    if (providerInUpdate === 'credentials') {
      if (update.$set) update.$set.emailVerified = false;
      else update.emailVerified = false;
      this.setUpdate(update);
    } else if (emailVerifiedInUpdate) {
      // provider might be in the query; check it
      const q = this.getQuery() || {};
      const providerInQuery = q.provider || null;
      if (providerInQuery === 'credentials') {
        if (update.$set) update.$set.emailVerified = false;
        else update.emailVerified = false;
        this.setUpdate(update);
      }
    }
  } catch (e) {
    // ignore
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;


