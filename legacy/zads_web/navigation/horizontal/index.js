export default [
  // Parent Items
  {
    title: 'Nav.FindTeachers',
    to: { name: 'parent' },
    icon: { icon: 'tabler-search' },
    action: 'read',
    subject: 'Parent',
  },
  {
    title: 'Nav.Favorites',
    to: { name: 'parent-favorites' },
    icon: { icon: 'tabler-heart' },
    action: 'read',
    subject: 'Parent',
  },
  {
    title: 'Nav.MyRequests',
    to: { name: 'parent-requests' },
    icon: { icon: 'tabler-mail' },
    action: 'manage',
    subject: 'Requests',
  },
  {
    title: 'Nav.MyChildren',
    to: { name: 'parent-children' },
    icon: { icon: 'tabler-users' },
    action: 'manage',
    subject: 'Children',
  },

  // Teacher Items
  {
    title: 'Nav.Dashboard',
    to: { name: 'teacher' },
    icon: { icon: 'tabler-dashboard' },
    action: 'read',
    subject: 'Teacher',
  },
  {
    title: 'Nav.BrowseRequests',
    to: { name: 'teacher-browse' },
    icon: { icon: 'tabler-search' },
    action: 'read',
    subject: 'Teacher',
  },
  {
    title: 'Nav.IncomingRequests',
    to: { name: 'teacher-requests' },
    icon: { icon: 'tabler-mail' },
    action: 'manage',
    subject: 'IncomingRequests',
  },
  {
    title: 'Nav.SubjectsPricing',
    to: { name: 'teacher-subjects' },
    icon: { icon: 'tabler-books' },
    action: 'manage',
    subject: 'Subjects',
  },
]
