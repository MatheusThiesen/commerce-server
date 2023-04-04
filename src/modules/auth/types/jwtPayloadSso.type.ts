export type JwtSsoPayload = {
  entity: 'seller' | 'user';
  sellerCod?: string;
  email?: string;
  timestamp: string;
  token: string;
};
