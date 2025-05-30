import { eventEmitter, BLOG_POST_UPDATED } from '../../../../lib/eventEmitter';

const ModeratorDashboard = () => {
  // ... existing state ...

  useEffect(() => {
    loadPosts();
  }, []);
} 