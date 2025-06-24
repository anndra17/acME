type AcmeNotification = {
  id: string;
  type: string;
  fromUserId?: string;
  postId?: string;
  commentId?: string;
  createdAt?: any;
  read?: boolean;
};