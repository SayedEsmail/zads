import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/user_type_selection_screen.dart';
import '../../features/auth/presentation/teacher_register_screen.dart';
import '../../features/auth/presentation/parent_register_screen.dart';
import '../../features/home/presentation/teacher_home_screen.dart';
import '../../features/home/presentation/parent_home_screen.dart';
import '../../features/teacher/presentation/teacher_profile_edit_screen.dart';
import '../../features/teacher/presentation/teacher_subjects_screen.dart';
import '../../features/teacher/presentation/teacher_profile_view_screen.dart';
import '../../features/parent/presentation/parent_profile_edit_screen.dart';
import '../../features/parent/presentation/parent_location_edit_screen.dart';
import '../../features/parent/presentation/parent_children_manage_screen.dart';
import '../../features/parent/presentation/parent_requests_screen.dart';
import '../../features/parent/presentation/request_details_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      // Auth Routes
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const UserTypeSelectionScreen(),
      ),
      GoRoute(
        path: '/register/teacher',
        builder: (context, state) => const TeacherRegisterScreen(),
      ),
      GoRoute(
        path: '/register/parent',
        builder: (context, state) => const ParentRegisterScreen(),
      ),

      // Teacher Routes
      GoRoute(
        path: '/teacher/home',
        builder: (context, state) => const TeacherHomeScreen(),
      ),
      GoRoute(
        path: '/teacher/profile/edit',
        builder: (context, state) => const TeacherProfileEditScreen(),
      ),
      GoRoute(
        path: '/teacher/subjects',
        builder: (context, state) => const TeacherSubjectsScreen(),
      ),
      GoRoute(
        path: '/teacher/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return TeacherProfileViewScreen(teacherId: id);
        },
      ),

      // Parent Routes
      GoRoute(
        path: '/parent/home',
        builder: (context, state) => const ParentHomeScreen(),
      ),
      GoRoute(
        path: '/parent/profile/edit',
        builder: (context, state) => const ParentProfileEditScreen(),
      ),
      GoRoute(
        path: '/parent/location/edit',
        builder: (context, state) => const ParentLocationEditScreen(),
      ),
      GoRoute(
        path: '/parent/children',
        builder: (context, state) => const ParentChildrenManageScreen(),
      ),
      GoRoute(
        path: '/parent/favorites',
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(
        path: '/parent/requests',
        builder: (context, state) => const ParentRequestsScreen(),
      ),
      GoRoute(
        path: '/parent/requests/:id',
        builder: (context, state) {
          final request = state.extra as Map<String, dynamic>;
          return RequestDetailsScreen(request: request);
        },
      ),
    ],
  );
});
