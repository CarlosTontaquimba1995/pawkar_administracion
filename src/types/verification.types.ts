export interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    existenRegistros: boolean;
  };
  timestamp: string;
}
