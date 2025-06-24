type Clinic = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total?: number;
  doctors: string[];
  reviews?: GoogleReview[];
  address?: string;
};