export type BlogCategory =
  | 'treatments'
  | 'lifestyle'
  | 'nutrition'
  | 'mental-health'
  | 'research'
  | 'success-stories'
  | 'expert-advice';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  featuredImage: string;
  category: BlogCategory;
  content: string;  // Main content of the blog post
  tags: string[];
  citations: Citation[];
  summary: string;
  isPublished: boolean;
  forumThreadId?: string; // Reference to the forum thread if discussion is enabled
  likes: string[]; // Array of user IDs who liked the post
  views: number;
} 

export interface Citation {
  id?: string;           // Poate să fie generat la salvare
  authors: string[];     // Listă de autori
  title: string;
  journal?: string;
  year?: number;
  url?: string;
  doi?: string;
  description?: string;
  type: 'article' | 'website' | 'book' | 'journal' | 'other';
}
