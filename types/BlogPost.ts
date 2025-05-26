export type BlogCategory =
  | 'treatments'
  | 'lifestyle'
  | 'nutrition'
  | 'mental-health'
  | 'research'
  | 'success-stories'
  | 'expert-advice';

export interface BlogSection {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  featuredImage: string;
  category: BlogCategory;
  sections: BlogSection[];
  tags: string[];
  summary: string;
  isPublished: boolean;
  forumThreadId?: string; // Reference to the forum thread if discussion is enabled
  likes: string[]; // Array of user IDs who liked the post
  views: number;
} 