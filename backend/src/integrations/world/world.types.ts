export interface RpContextResponse {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
}

export interface VerifyProofResult {
  success: boolean;
  nullifier?: string;
  error?: string;
  detail?: string;
  environment?: string;
}

export interface WorldIdVerifyRequestBody {
  protocol_version: string;
  nonce: string;
  action: string;
  session_id?: string;
  responses: Array<{
    identifier: string;
    nullifier: string;
    proof?: string | string[];
    merkle_root?: string;
    signal_hash?: string;
    issuer_schema_id?: number;
    expires_at_min?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

