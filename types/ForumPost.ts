export type Topic =
  | 'alimentation'
  | 'treatments'
  | 'mental health'
  | 'stress management'
  | 'advices'
  | 'experiences'
  | 'side effects';

export interface Post {
  id: string;
  userId: string; // referință către user
  imagesUrl: string[];
  createdAt: string; // ex: new Date().toISOString()
  title: string;
  sections: string[];
  topic: Topic[];
  treatmentUsed?: string;
  likes: string[]; // array cu userIds care au dat like
  isPublic: boolean;
  type?: 'forum';
  tags?: string[];
}
