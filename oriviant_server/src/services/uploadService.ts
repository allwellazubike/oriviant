/**
 * Signed image uploads to Cloudinary.
 *
 * Deposits are confirmed by a human, so the admin needs to see what the user
 * says they sent — a wallet screenshot or explorer receipt. Those images are
 * uploaded here rather than stored in Postgres: the database holds the URL,
 * Cloudinary holds the bytes.
 *
 * The signature is computed server-side, so the API secret never reaches the
 * browser and nobody can push arbitrary files into our account. Implemented
 * with node:crypto against Cloudinary's REST endpoint instead of the SDK — it
 * is one sha1 and one POST, and it keeps the dependency list short.
 */

import crypto from 'crypto';

/** Base64 payloads are ~1.37x the raw bytes, so this caps originals near 5MB. */
const MAX_DATA_URI_LENGTH = 7_000_000;

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];

export class UploadError extends Error {}

/** Rejects anything that is not a plausible, small-enough image data URI. */
export const assertValidProofDataUri = (dataUri: string): void => {
  const match = /^data:([a-z/+.-]+);base64,/i.exec(dataUri);

  if (!match) {
    throw new UploadError('Proof must be an image file.');
  }

  if (!ALLOWED_MIME.includes(match[1].toLowerCase())) {
    throw new UploadError('Proof must be a PNG, JPG, WEBP or PDF file.');
  }

  if (dataUri.length > MAX_DATA_URI_LENGTH) {
    throw new UploadError('Proof file is too large. Please keep it under 5MB.');
  }
};

/** How long to wait on Cloudinary before giving up on one attempt. */
const UPLOAD_TIMEOUT_MS = 30_000;

const attemptUpload = async (
  dataUri: string,
  userId: number,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<string | null> => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `oriviant/deposit-proofs/${userId}`;

  // Cloudinary signs the alphabetically-sorted params that are not file/api_key,
  // joined as key=value pairs, with the API secret appended.
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const form = new URLSearchParams({
    file: dataUri,
    api_key: apiKey,
    timestamp: String(timestamp),
    folder,
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };

  if (!response.ok || !payload.secure_url) {
    console.error('[upload] Cloudinary rejected the upload:', payload.error?.message ?? response.status);
    return null;
  }

  return payload.secure_url;
};

/**
 * Uploads a base64 data URI and returns its secure URL, or null if it could
 * not be stored.
 *
 * Null rather than throwing, because of what sits downstream: the caller is
 * filing a deposit, and the deposit is the part that matters. A screenshot is
 * corroboration the admin would like to have, not a precondition for the user
 * telling us they sent money. Losing the network to Cloudinary for ten seconds
 * must not mean the deposit request is refused — the user has already made an
 * irreversible on-chain transfer by this point, and turning them away leaves
 * real funds with nothing in our system pointing at them.
 *
 * Validation problems are the exception and still throw UploadError: a file
 * that is the wrong type or too big is something the user can fix by picking a
 * different one, so they should be told rather than silently dropped.
 */
export const uploadDepositProof = async (dataUri: string, userId: number): Promise<string | null> => {
  assertValidProofDataUri(dataUri);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[upload] Cloudinary is not configured — filing the deposit without proof.');
    return null;
  }

  // One retry: the failure this guards against is a transient connect timeout,
  // which a second attempt a moment later usually clears.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const url = await attemptUpload(dataUri, userId, cloudName, apiKey, apiSecret);
      if (url) return url;
    } catch (error) {
      console.error(
        `[upload] Attempt ${attempt}/2 failed to reach Cloudinary:`,
        (error as Error).message
      );
    }
  }

  return null;
};
