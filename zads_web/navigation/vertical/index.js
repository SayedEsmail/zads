export default [
  { heading: 'Parent Dashboard' },
  {
    title: 'Find Teachers',
    to: { name: 'parent' },
    icon: { icon: 'tabler-search' },
  },
  {
    title: 'My Children',
    to: { name: 'parent-children' },
    icon: { icon: 'tabler-users' },
  },
  {
    title: 'Contact Requests',
    to: { name: 'parent-requests' },
    icon: { icon: 'tabler-mail' },
  },
  {
    title: 'Favorites',
    to: { name: 'parent-favorites' },
    icon: { icon: 'tabler-heart' },
  },

  { heading: 'Teacher Dashboard' },
  {
    title: 'Dashboard',
    to: { name: 'teacher' },
    icon: { icon: 'tabler-dashboard' },
  },
  {
    title: 'Edit Profile',
    to: { name: 'teacher-profile' },
    icon: { icon: 'tabler-user-edit' },
  },
  {
    title: 'Subjects & Pricing',
    to: { name: 'teacher-subjects' },
    icon: { icon: 'tabler-books' },
  },
  {
    title: 'Incoming Requests',
    to: { name: 'teacher-requests' },
    icon: { icon: 'tabler-mail' },
  },
  {
    title: 'Browse Tutor Requests',
    to: { name: 'teacher-browse' },
    icon: { icon: 'tabler-search' },
  },
]
