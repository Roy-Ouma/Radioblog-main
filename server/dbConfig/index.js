import mongoose from "mongoose";

const dbConnection = async () => {
  try {
   const opts = {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   };

   if (process.env.MONGO_TLS_ALLOW_INVALID === 'true') {
     opts.tls = true;
     opts.tlsAllowInvalidCertificates = true;
     opts.tlsInsecure = true;
   }

   await mongoose.connect(process.env.MONGODB_URL, opts);
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection error:", error && error.message ? error.message : error);
    console.log("Tip: set MONGO_TLS_ALLOW_INVALID=true in server/.env for a local insecure fallback (dev only). For production, fix CA verification or update Node/OpenSSL.");
  }
};

export default dbConnection;