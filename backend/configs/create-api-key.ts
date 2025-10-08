import { api } from "encore.dev/api";
import { createServiceClient } from '../lib/supabase';
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || "change-this-to-a-secure-32-byte-key!!";

function encryptSecret(plaintext: string): string {
  const algorithm = "aes-256-gcm";
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

interface CreateApiKeyRequest {
  orgId: string;
  provider: string;
  name: string;
  secret: string;
  createdBy?: string;
}

interface CreateApiKeyResponse {
  item: {
    id: string;
    org_id: string;
    provider: string;
    name: string;
    created_by: string | null;
    created_at: Date;
  };
}

export const createApiKey = api(
  {
    method: "POST",
    path: "/orgs/:orgId/api-keys",
    expose: true,
  },
  async ({
    orgId,
    provider,
    name,
    secret,
    createdBy,
  }: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const encryptedSecret = encryptSecret(secret);
    const supabase = createServiceClient();

    const { data: key, error } = await supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        provider,
        name,
        secret: encryptedSecret,
        created_by: createdBy ?? null
      })
      .select('id, org_id, provider, name, created_by, created_at')
      .single();

    if (error || !key) {
      throw new Error(error?.message || "Failed to create API key");
    }

    return { item: key };
  }
);
