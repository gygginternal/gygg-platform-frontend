import { useNavigate } from 'react-router-dom';
import PostCreateForm from '../../components/PostCreatePage/PostCreateForm';

function PostCreatePage() {
  const navigate = useNavigate();

  const handlePostSuccess = () => {
    // After successful post creation, redirect to the main feed
    navigate('/feed'); // Redirect to the feed page
  };

  return (
    <div>
      <h2>Create Post</h2>
      <PostCreateForm onSubmitSuccess={handlePostSuccess} />
    </div>
  );
}

export default PostCreatePage;
