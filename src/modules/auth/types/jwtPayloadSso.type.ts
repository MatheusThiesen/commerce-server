export type JwtSsoPayload = {
  entity: string;
  sellerCod?: string;
  email?: string;
  path: string;
  timestamp: string;
  token: string;
};
