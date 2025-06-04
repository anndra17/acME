export type SkinCondition =
  | 'normal'
  | 'dry'
  | 'oily'
  | 'irritated'
  | 'inflamed'
  | 'burned'
  | 'painful';

export interface Post {
  id: string;
  userId: string; // referință către user
  imageUrl: string;
  createdAt: string; // ex: new Date().toISOString()
  description?: string;
  stressLevel: number;  // scale 0 to 5   
  skinConditions?: SkinCondition[];
  treatmentUsed?: string;
  predictionLabel?: string;  // rezultat model AI ex: "Acnee severă"
  predictionConfidence?: number; // opțional: 0.93
  likes: string[]; // array cu userIds care au dat like
  tags?: string[];
  hasDoctorFeedback?: boolean; // apare doar dacă userul colab cu un medic
  reviewed?: boolean; // <--- adaugă această linie
}
