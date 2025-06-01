export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toDoctorId: string;
  status: string;
  createdAt?: any;
  // adaugă aici alte câmpuri dacă ai nevoie
}