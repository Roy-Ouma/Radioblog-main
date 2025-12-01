import mongoose from "mongoose";

export default async function dbConnection() {
  // Support multiple common env names to avoid confusion (README previously used MONGODB_URL)
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) throw new Error("Mongo connection string not set in environment (MONGO_URI, MONGODB_URI or MONGODB_URL)");

  try {
    // Use robust options with reasonable timeouts and optional relaxed TLS for local dev.
    const baseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Timeouts to avoid hanging requests during transient network issues
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      // limit pool size for dev machines
      maxPoolSize: 10,
      // prefer IPv4 resolution where some environments have IPv6 issues
      family: 4,
    };

    if (process.env.MONGO_TLS_ALLOW_INVALID === 'true') {
      // For SRV connections the driver uses TLS by default; relax cert/hostname checks for local dev only
      baseOpts.tls = true;
      baseOpts.tlsAllowInvalidCertificates = true;
      baseOpts.tlsAllowInvalidHostnames = true;
    }

    // Retry loop for transient network/TLS handshake failures (short, conservative retries)
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await mongoose.connect(uri, baseOpts);
        console.log("MongoDB connected");
        break;
      } catch (connectErr) {
        attempt += 1;
        console.warn(`Mongo connect attempt ${attempt} failed: ${connectErr && connectErr.message}`);
        if (attempt >= maxRetries) {
          throw connectErr;
        }
        // small backoff before retrying
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  } catch (err) {
    console.error("Database connection error:", err && err.message ? err.message : err);
    console.error("If this is a TLS/SSL error, consider: 1) enabling MONGO_TLS_ALLOW_INVALID=true for development only, 2) verifying your connection string and CA certs, or 3) updating Node/OpenSSL to a newer version that supports the server ciphers.");
    throw err;
  }
}