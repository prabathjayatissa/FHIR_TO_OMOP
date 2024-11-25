export interface FhirConfig {
  baseUrl: string;
  apiKey?: string;
  useAuth: boolean;
  username?: string;
  password?: string;
}

export interface FhirConnectionStatus {
  success: boolean;
  message: string;
}