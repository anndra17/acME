export interface ForumThread {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  category: string; // ex: 'blog-discussion'
  blogPostId: string;
  likes: string[]; // userIds
  replies: any[];  // sau un tip mai clar, dacă ai o structură pt răspunsuri
}
