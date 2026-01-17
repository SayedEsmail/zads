import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../parent/providers/parent_provider.dart';
import '../../search/providers/search_provider.dart';
import '../../favorites/providers/favorites_provider.dart';

import '../../common/presentation/widgets/teacher_card.dart';

class ParentHomeScreen extends ConsumerStatefulWidget {
  const ParentHomeScreen({super.key});

  @override
  ConsumerState<ParentHomeScreen> createState() => _ParentHomeScreenState();
}

class _ParentHomeScreenState extends ConsumerState<ParentHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(parentProfileProvider.notifier).loadProfile();
      ref.read(parentChildrenProvider.notifier).loadChildren();
      ref.read(favoritesProvider.notifier).loadFavorites();
    });
  }

  void _loadTeachers() {
    final profile = ref.read(parentProfileProvider).profile;
    final area = profile?['area'];
    final areaId = area?['id'];
    final city = area?['city'];
    final cityId = city?['id'];
    final governorate = city?['governorate'];
    final governorateId = governorate?['id'];

    // Search by governorate (to get all teachers), but pass areaId and cityId for sorting
    ref
        .read(teacherSearchProvider.notifier)
        .searchTeachers(
          governorateId: governorateId,
          areaId: areaId,
          cityId: cityId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(parentProfileProvider);
    // final childrenState = ref.watch(parentChildrenProvider);
    final searchState = ref.watch(teacherSearchProvider);
    // final favoritesState = ref.watch(favoritesProvider);

    // Load teachers when profile loads
    ref.listen<ParentProfileState>(parentProfileProvider, (prev, next) {
      if (prev?.profile == null && next.profile != null) {
        _loadTeachers();
      }
    });

    final profile = profileState.profile;
    final hasLocation = profile?['areaId'] != null;
    final locationName =
        profile?['area']?['nameAr'] ??
        profile?['area']?['city']?['nameAr'] ??
        'لم يتم تحديد الموقع';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Image.asset('assets/images/logo.png', height: 60),
        actions: const [],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(parentProfileProvider.notifier).loadProfile();
          _loadTeachers();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(
                    0xFFFFF4E6,
                  ), // Light orange/beige background
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'مرحباً ${profile?['user']?['name']?.split(' ').first ?? 'يا زائر'}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2D2D2D),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'اعثر على أفضل المعلمين\nلأبنائك بسهولة',
                            style: TextStyle(
                              fontSize: 14,
                              color: Color(0xFF666666),
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Illustration
                    Image.asset(
                      'assets/images/logo.png', // Placeholder for illustration (users illustration from ref)
                      height: 100,
                      width: 100,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Location Banner (Simplified or Removed? Keeping simplified below Greeting)
              if (hasLocation) ...[
                Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      locationName,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.push('/parent/location/edit'),
                      child: const Text('تغيير'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ] else ...[
                // Keep "Select Location" prominent if missing
                GestureDetector(
                  onTap: () => context.push('/parent/location/edit'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.warning),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.warning_amber_rounded,
                          color: AppColors.warning,
                        ),
                        SizedBox(width: 12),
                        Text('يرجى تحديد موقعك لعرض المعلمين'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              const SizedBox(height: 12),
              const Divider(color: Color(0xFFEEEEEE), thickness: 1),
              const SizedBox(height: 12),

              // Quick Actions
              Row(
                children: [
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.child_care_rounded,
                      label: 'أبنائي',
                      color: const Color(0xFFE3F2FD), // Light Blue
                      iconColor: AppColors.primary,
                      onTap: () => context.push('/parent/children'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.favorite_rounded,
                      label: 'المفضلة',
                      color: const Color(0xFFFFEBEE), // Light Red
                      iconColor: Colors.red,
                      onTap: () => context.push('/parent/favorites'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.assignment_rounded,
                      label: 'طلباتي',
                      color: const Color(0xFFE0F2F1), // Light Green
                      iconColor: Colors.teal,
                      onTap: () => context.push('/parent/requests'),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(color: Color(0xFFEEEEEE), thickness: 1),
              const SizedBox(height: 12),

              // Teachers Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'معلمون في منطقتك',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (hasLocation)
                        Text(
                          '${searchState.total} معلم',
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                        ),
                    ],
                  ),
                  if (searchState.teachers.isNotEmpty)
                    TextButton(
                      onPressed: () => context.push('/parent/search'),
                      child: const Text(
                        'عرض الكل',
                        style: TextStyle(color: AppColors.primary),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Teachers List
              if (searchState.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (!hasLocation)
                _EmptyState(
                  icon: Icons.location_on,
                  title: 'حدد موقعك أولاً',
                  subtitle: 'حدد موقعك لنعرض لك المعلمين القريبين منك',
                  actionLabel: 'تحديد الموقع',
                  onAction: () => context.push('/parent/profile/edit'),
                )
              else if (searchState.teachers.isEmpty)
                const _EmptyState(
                  icon: Icons.school,
                  title: 'لا يوجد معلمون',
                  subtitle: 'لا يوجد معلمون في منطقتك حالياً',
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: searchState.teachers.length,
                  itemBuilder: (context, index) {
                    final teacher = searchState.teachers[index];
                    return TeacherCard(teacher: teacher);
                  },
                ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) {
            context.push('/parent/search');
          } else if (index == 2) {
            context.push('/notifications');
          } else if (index == 3) {
            context.push('/settings');
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'الرئيسية',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search_rounded),
            label: 'البحث',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications_rounded),
            label: 'الإشعارات',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color iconColor;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: iconColor, size: 32),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: AppColors.textSecondary),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onAction,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                // shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), // Removed to inherit Theme (16)
              ),
              child: Text(
                actionLabel!,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
