export type JwtSsoPayload = {
  entity: 'seller' | 'user' | 'client';
  sellerCod?: string;
  email?: string;
  timestamp: string;
  token: string;
};
