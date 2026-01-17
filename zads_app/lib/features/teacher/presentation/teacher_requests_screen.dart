import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../contact/providers/contact_provider.dart';
import '../../teacher/providers/teacher_provider.dart';

class TeacherRequestsScreen extends ConsumerStatefulWidget {
  const TeacherRequestsScreen({super.key});

  @override
  ConsumerState<TeacherRequestsScreen> createState() =>
      _TeacherRequestsScreenState();
}

class _TeacherRequestsScreenState extends ConsumerState<TeacherRequestsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Future.microtask(() {
      ref.read(contactProvider.notifier).loadIncomingRequests();
      ref.read(teacherTutorRequestsProvider.notifier).loadRequests();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'الطلبات',
          style: TextStyle(
            color: Colors.black,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'الطلاب'),
            Tab(text: 'طلبات التواصل'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [_TutorRequestsTab(), _ContactRequestsTab()],
      ),
    );
  }
}

class _TutorRequestsTab extends ConsumerWidget {
  const _TutorRequestsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(teacherTutorRequestsProvider);

    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (state.requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.school_rounded,
              size: 64,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            const Text(
              'لا توجد طلاب يبحثون عن معلمين حالياً',
              style: TextStyle(
                fontSize: 18,
                fontFamily: 'Cairo',
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: state.requests.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final request = state.requests[index];
        return _TutorRequestCard(request: request);
      },
    );
  }
}

class _ContactRequestsTab extends ConsumerWidget {
  const _ContactRequestsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(contactProvider);

    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (state.requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.message_rounded,
              size: 64,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            const Text(
              'لا توجد طلبات تواصل حالياً',
              style: TextStyle(
                fontSize: 18,
                fontFamily: 'Cairo',
                color: AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: state.requests.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final request = state.requests[index];
        return _RequestCard(request: request);
      },
    );
  }
}

class _TutorRequestCard extends StatelessWidget {
  final Map<String, dynamic> request;

  const _TutorRequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final parent = request['parent'];
    final parentName =
        parent?['user']?['name'] ??
        'ولي أمر'; // Adjusted path if needed, usually include parent -> user
    final subject = request['subject'];
    final subjectName = subject?['nameAr'] ?? subject?['nameEn'] ?? 'مادة';
    final stage = request['stage'];
    final stageName = stage?['nameAr'] ?? stage?['nameEn'] ?? 'مرحلة';
    // Description contains "child name" usually if auto-generated: "طلب معلم لـ X"
    final description = request['description'] ?? '';
    final createdAt = request['createdAt'];
    final formattedDate = createdAt != null
        ? DateFormat('dd/MM/yyyy').format(DateTime.parse(createdAt))
        : '';

    // Check if current teacher already sent contact request?
    // Usually backend might return 'contactStatus' or similar if we asked.
    // For now assuming just "Request Contact".

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Chip(
                label: Text(
                  subjectName,
                  style: const TextStyle(
                    fontFamily: 'Cairo',
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                backgroundColor: AppColors.primary,
                padding: EdgeInsets.zero,
                labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              Text(
                formattedDate,
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '$parentName يبحث عن معلم',
            style: const TextStyle(
              fontFamily: 'Cairo',
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              description,
              style: const TextStyle(
                fontFamily: 'Cairo',
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              stageName,
              style: const TextStyle(
                fontFamily: 'Cairo',
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // TODO: Request contact with parent
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'تواصل مع ولي الأمر',
                style: TextStyle(
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final Map<String, dynamic> request;

  const _RequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final parent = request['parent'];
    final parentName = parent?['user']?['name'] ?? parent?['name'] ?? 'ولي أمر';
    final parentPhone = parent?['user']?['phone'] ?? parent?['phone'] ?? '---';
    final createdAt = request['createdAt'];
    final formattedDate = createdAt != null
        ? DateFormat('dd/MM/yyyy').format(DateTime.parse(createdAt))
        : '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person_rounded,
                  color: AppColors.secondary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      parentName,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formattedDate,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'جديد',
                  style: TextStyle(
                    fontFamily: 'Cairo',
                    color: AppColors.success,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(
                Icons.phone_rounded,
                size: 20,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 8),
              Text(
                parentPhone,
                style: const TextStyle(
                  fontFamily: 'Cairo',
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () async {
                  final Uri launchUri = Uri(scheme: 'tel', path: parentPhone);
                  if (await canLaunchUrl(launchUri)) {
                    await launchUrl(launchUri);
                  } else {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'لا يمكن إجراء الاتصال',
                            style: TextStyle(fontFamily: 'Cairo'),
                          ),
                        ),
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                ),
                icon: const Icon(Icons.call, size: 18),
                label: const Text(
                  'اتصال',
                  style: TextStyle(fontFamily: 'Cairo'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
