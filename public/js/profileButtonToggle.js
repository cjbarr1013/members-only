const postsBtn = document.querySelector('#postsBtn');
const commentsBtn = document.querySelector('#commentsBtn');
const posts = document.querySelector('#posts');
const comments = document.querySelector('#comments');

const activeStyles = [
  'border-transparent',
  'bg-gray-100',
  'dark:bg-gray-700',
  'ring-2',
  'ring-blue-700',
  'dark:ring-blue-500',
  'z-2',
];
const inactiveStyles = [
  'bg-transparent',
  'border-gray-200',
  'dark:border-gray-700',
];

function activatePosts() {
  comments.classList.add('hidden');
  commentsBtn.classList.add(...inactiveStyles);
  commentsBtn.classList.remove(...activeStyles);

  posts.classList.remove('hidden');
  postsBtn.classList.remove(...inactiveStyles);
  postsBtn.classList.add(...activeStyles);
}

function activateComments() {
  posts.classList.add('hidden');
  postsBtn.classList.add(...inactiveStyles);
  postsBtn.classList.remove(...activeStyles);

  comments.classList.remove('hidden');
  commentsBtn.classList.remove(...inactiveStyles);
  commentsBtn.classList.add(...activeStyles);
}

if (!posts.classList.contains('hidden')) {
  activatePosts();
} else if (!comments.classList.contains('hidden')) {
  activateComments();
}

postsBtn.addEventListener('click', () => {
  if (posts.classList.contains('hidden')) activatePosts();
});

commentsBtn.addEventListener('click', () => {
  if (comments.classList.contains('hidden')) activateComments();
});
