import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../search/data/search_repository.dart';
import '../../favorites/providers/favorites_provider.dart';
import '../../contact/providers/contact_provider.dart';

class TeacherProfileViewScreen extends ConsumerStatefulWidget {
  final String teacherId;

  const TeacherProfileViewScreen({super.key, required this.teacherId});

  @override
  ConsumerState<TeacherProfileViewScreen> createState() =>
      _TeacherProfileViewScreenState();
}

class _TeacherProfileViewScreenState
    extends ConsumerState<TeacherProfileViewScreen> {
  Map<String, dynamic>? teacher;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadTeacher();
  }

  Future<void> _loadTeacher() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final response = await ref
          .read(searchRepositoryProvider)
          .getTeacherById(widget.teacherId);
      setState(() {
        teacher = response['data'];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (error != null || teacher == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                error ?? 'حدث خطأ',
                style: const TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadTeacher,
                child: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    final user = teacher!['user'] ?? {};
    final subjects = (teacher!['subjects'] as List? ?? []);
    final isVerified = teacher!['isVerified'] == true;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.black),
            onPressed: () {
              // TODO: Share
            },
          ),
          Consumer(
            builder: (context, ref, child) {
              final favoritesState = ref.watch(favoritesProvider);
              final isFavorite = favoritesState.isFavorite(widget.teacherId);
              return IconButton(
                icon: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: isFavorite ? Colors.red : Colors.black,
                ),
                onPressed: () {
                  ref
                      .read(favoritesProvider.notifier)
                      .toggleFavorite(widget.teacherId);
                },
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Avatar & Name
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primary.withOpacity(0.1),
                    backgroundImage: user['avatarUrl'] != null
                        ? NetworkImage(user['avatarUrl'])
                        : null,
                    child: user['avatarUrl'] == null
                        ? Text(
                            (user['name'] ?? 'م')[0],
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 36,
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
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.verified,
                          color: AppColors.primary,
                          size: 20,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              user['name'] ?? 'معلم',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 24),

            // Stats Row
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.work_outline,
                    value: '${teacher!['experienceYears'] ?? 0} سنوات',
                    label: 'خبرة',
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatCard(
                    icon: Icons.visibility_outlined,
                    value: '${teacher!['viewsCount'] ?? 0}',
                    label: 'مشهادة',
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _StatCard(
                    icon: Icons.school_outlined,
                    value: '${subjects.length}',
                    label: 'مواد',
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // About Me
            if (teacher!['bio'] != null &&
                teacher!['bio'].toString().isNotEmpty)
              _ContentCard(
                title: 'نبذة عني',
                child: Text(
                  teacher!['bio'],
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            const SizedBox(height: 16),

            // Qualification
            if (teacher!['qualification'] != null &&
                teacher!['qualification'].toString().isNotEmpty)
              _ContentCard(
                title: 'المؤهل العلمي',
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.school, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Text(
                      teacher!['qualification'],
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Lesson Types
            if (teacher!['lessonTypes'] != null &&
                (teacher!['lessonTypes'] as List).isNotEmpty)
              _ContentCard(
                title: 'أنواع الدروس',
                child: Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 8,
                  runSpacing: 8,
                  children: (teacher!['lessonTypes'] as List).map<Widget>((
                    type,
                  ) {
                    String label = '';
                    IconData icon = Icons.home;
                    if (type == 'at_teacher') {
                      label = 'في بيت المعلم';
                      icon = Icons.home;
                    } else if (type == 'at_student') {
                      label = 'في بيت الطالب';
                      icon = Icons.directions_walk;
                    } else if (type == 'group') {
                      label = 'مجموعات';
                      icon = Icons.groups;
                    } else if (type == 'online') {
                      label = 'أونلاين';
                      icon = Icons.videocam;
                    }
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: type == 'online'
                            ? const Color(0xFFFFECC5)
                            : const Color(0xFFE3F2FD),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: type == 'online'
                              ? Colors.orange.withOpacity(0.5)
                              : AppColors.primary.withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            icon,
                            size: 16,
                            color: type == 'online'
                                ? Colors.orange
                                : AppColors.primary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            label,
                            style: TextStyle(
                              fontSize: 13,
                              color: type == 'online'
                                  ? Colors.orange[800]
                                  : AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            const SizedBox(height: 16),

            // Subjects
            if (subjects.isNotEmpty) ...[
              const Text(
                'المواد والأسعار',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              ...subjects.map((subj) => _SubjectPriceListItem(subject: subj)),
            ],
            const SizedBox(height: 100),
          ],
        ),
      ),
      bottomSheet: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Consumer(
          builder: (context, ref, child) {
            final contactState = ref.watch(contactProvider);
            return ElevatedButton.icon(
              onPressed: contactState.isLoading
                  ? null
                  : () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('طلب تواصل'),
                          content: const Text(
                            'سيتم إرسال طلب تواصل إلى المعلم. هل تود المتابعة؟',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => context.pop(),
                              child: const Text('إلغاء'),
                            ),
                            TextButton(
                              onPressed: () {
                                context.pop();
                                ref
                                    .read(contactProvider.notifier)
                                    .sendContactRequest(widget.teacherId);
                              },
                              child: const Text('تأكيد'),
                            ),
                          ],
                        ),
                      );
                    },
              icon: const Icon(Icons.chat_bubble_outline),
              label: Text(
                contactState.isLoading ? 'جاري الإرسال...' : 'تواصل مع المعلم',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(
                  0xFF64B5F6,
                ), // Light Blue like design
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    this.color = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ContentCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _ContentCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _SubjectPriceListItem extends StatelessWidget {
  final Map<String, dynamic> subject;

  const _SubjectPriceListItem({required this.subject});

  @override
  Widget build(BuildContext context) {
    final subjectData = subject['subject'] ?? {};
    final stageData = subject['stage'] ?? {};
    final price =
        subject['priceAtTeacher'] ??
        subject['priceAtStudent'] ??
        subject['priceGroup'] ??
        0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${subjectData['nameAr'] ?? ''} - ${stageData['nameAr'] ?? ''}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFFECC5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Text(
                  '$price', // Format currency if needed
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF8D6E63),
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.local_offer,
                  size: 14,
                  color: Color(0xFF8D6E63),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
