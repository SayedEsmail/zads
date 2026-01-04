import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/favorites_provider.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(favoritesProvider.notifier).loadFavorites();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(favoritesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: const Text(
          'المفضلة',
          style: TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(favoritesProvider.notifier).loadFavorites(),
        child: state.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : state.favorites.isEmpty
            ? _buildEmptyState()
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.favorites.length,
                itemBuilder: (context, index) {
                  final favorite = state.favorites[index];
                  final teacher = favorite['teacher'] ?? {};
                  return _FavoriteTeacherCard(
                    favorite: favorite,
                    teacher: teacher,
                    onRemove: () async {
                      final teacherId = favorite['teacherId'] as String?;
                      if (teacherId != null) {
                        await ref
                            .read(favoritesProvider.notifier)
                            .removeFromFavorites(teacherId);
                      }
                    },
                  );
                },
              ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.favorite_border,
                  size: 64,
                  color: Colors.red,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'لا يوجد معلمون في المفضلة',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'اضغط على أيقونة القلب في صفحة المعلم\nلإضافته إلى المفضلة',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontFamily: 'Cairo',
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => context.go('/parent/home'),
                icon: const Icon(Icons.search, color: Colors.white),
                label: const Text(
                  'ابحث عن معلمين',
                  style: TextStyle(fontFamily: 'Cairo', color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FavoriteTeacherCard extends StatelessWidget {
  final Map<String, dynamic> favorite;
  final Map<String, dynamic> teacher;
  final VoidCallback onRemove;

  const _FavoriteTeacherCard({
    required this.favorite,
    required this.teacher,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final user = teacher['user'] ?? {};
    final subjects = (teacher['subjects'] as List? ?? []);
    final subjectNames = subjects
        .map((s) => s['subject']?['nameAr'] ?? '')
        .where((s) => s.isNotEmpty)
        .take(3)
        .join('، ');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            context.push('/teacher/${teacher['id']}');
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  backgroundImage: user['avatarUrl'] != null
                      ? NetworkImage(user['avatarUrl'])
                      : null,
                  child: user['avatarUrl'] == null
                      ? Text(
                          (user['name'] ?? 'م')[0],
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user['name'] ?? 'معلم',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      if (subjectNames.isNotEmpty)
                        Text(
                          subjectNames,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.primary,
                            fontFamily: 'Cairo',
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),

                // Remove button
                IconButton(
                  icon: const Icon(Icons.favorite, color: Colors.red, size: 28),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text(
                          'إزالة من المفضلة',
                          style: TextStyle(fontFamily: 'Cairo'),
                          textAlign: TextAlign.center,
                        ),
                        content: Text(
                          'هل تريد إزالة ${user['name'] ?? 'المعلم'} من المفضلة؟',
                          style: const TextStyle(fontFamily: 'Cairo'),
                          textAlign: TextAlign.center,
                        ),
                        actionsAlignment: MainAxisAlignment.center,
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text(
                              'إلغاء',
                              style: TextStyle(fontFamily: 'Cairo'),
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              onRemove();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                            ),
                            child: const Text(
                              'إزالة',
                              style: TextStyle(
                                fontFamily: 'Cairo',
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
