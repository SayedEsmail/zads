import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../favorites/providers/favorites_provider.dart';

class TeacherCard extends ConsumerWidget {
  final Map<String, dynamic> teacher;

  const TeacherCard({super.key, required this.teacher});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = teacher['user'] ?? {};
    final subjects = (teacher['subjects'] as List? ?? []);
    final subjectNames = subjects
        .map((s) => s['subject']?['nameAr'] ?? '')
        .where((s) => s.isNotEmpty)
        .take(3)
        .join('، ');
    final area = teacher['area'];
    final areaName = area?['nameAr'] ?? area?['city']?['nameAr'] ?? '';
    final rating =
        double.tryParse(teacher['avgRating']?.toString() ?? '0') ?? 0;
    final isVerified = teacher['isVerified'] == true;

    final teacherId = teacher['id'] as String?;
    final favoritesState = ref.watch(favoritesProvider);
    final isFavorite =
        teacherId != null && favoritesState.isFavorite(teacherId);

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
            // Navigate to teacher profile
            context.push('/teacher/${teacher['id']}');
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                Stack(
                  children: [
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
                    if (isVerified)
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.verified,
                            color: AppColors.primary,
                            size: 16,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              user['name'] ?? 'معلم',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ),
                          if (rating > 0) ...[
                            const Icon(
                              Icons.star,
                              color: Colors.amber,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              rating.toStringAsFixed(1),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ],
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
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            areaName,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(
                            Icons.work,
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${teacher['experienceYears'] ?? 0} سنة',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Favorite Heart Button
                IconButton(
                  icon: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? Colors.red : AppColors.textSecondary,
                    size: 24,
                  ),
                  onPressed: () {
                    if (teacherId != null) {
                      ref
                          .read(favoritesProvider.notifier)
                          .toggleFavorite(teacherId);
                    }
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
