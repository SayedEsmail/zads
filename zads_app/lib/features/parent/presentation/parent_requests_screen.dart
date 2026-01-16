import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/parent_provider.dart';

import '../../contact/providers/contact_provider.dart';

class ParentRequestsScreen extends ConsumerStatefulWidget {
  const ParentRequestsScreen({super.key});

  @override
  ConsumerState<ParentRequestsScreen> createState() =>
      _ParentRequestsScreenState();
}

class _ParentRequestsScreenState extends ConsumerState<ParentRequestsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String selectedFilter = 'all'; // all, active, expired

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    Future.microtask(() {
      ref.read(tutorRequestsProvider.notifier).loadRequests();
      ref.read(contactProvider.notifier).loadOutgoingRequests();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredRequests(List<dynamic> requests) {
    if (selectedFilter == 'all') return requests;
    return requests.where((r) => r['status'] == selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'طلباتي',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'طلبات الدروس'),
            Tab(text: 'طلبات التواصل'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTutorRequests(),
          _buildContactRequests(),
        ],
      ),
    );
  }

  Widget _buildTutorRequests() {
    final requestsState = ref.watch(tutorRequestsProvider);
    final filteredRequests = _getFilteredRequests(requestsState.requests);

    if (requestsState.isLoading) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(tutorRequestsProvider.notifier).loadRequests(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'الكل',
                    isSelected: selectedFilter == 'all',
                    count: requestsState.requests.length,
                    onTap: () => setState(() => selectedFilter = 'all'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'نشط',
                    isSelected: selectedFilter == 'active',
                    count: requestsState.requests
                        .where((r) => r['status'] == 'active')
                        .length,
                    onTap: () => setState(() => selectedFilter = 'active'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'منتهي',
                    isSelected: selectedFilter == 'closed',
                    count: requestsState.requests
                        .where((r) => r['status'] == 'closed')
                        .length,
                    onTap: () => setState(() => selectedFilter = 'closed'),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Requests List
            if (filteredRequests.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(48),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.assignment_outlined,
                      size: 64,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      selectedFilter == 'all'
                          ? 'لا توجد طلبات'
                          : selectedFilter == 'active'
                              ? 'لا توجد طلبات نشطة'
                              : 'لا توجد طلبات منتهية',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'سيتم إنشاء طلبات تلقائياً عند إضافة أبناء',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              )
            else
              ...filteredRequests.map((request) {
                return GestureDetector(
                  onTap: () {
                    context.push(
                      '/parent/requests/${request['id']}',
                      extra: request,
                    );
                  },
                  child: _RequestCard(request: request),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRequests() {
    final contactState = ref.watch(contactProvider);

    if (contactState.isLoading) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (contactState.requests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.contact_mail_outlined,
              size: 64,
              color: AppColors.textSecondary,
            ),
            const SizedBox(height: 16),
            const Text(
              'لا توجد طلبات تواصل',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                fontFamily: 'Cairo',
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'يمكنك التواصل مع المعلمين من خلال صفحاتهم الشخصية',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontFamily: 'Cairo',
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(contactProvider.notifier).loadOutgoingRequests(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: contactState.requests.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final request = contactState.requests[index];
          return _ContactRequestCard(request: request);
        },
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final int count;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.count,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontFamily: 'Cairo',
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withOpacity(0.3)
                    : AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                count.toString(),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : AppColors.primary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final Map<String, dynamic> request;

  const _RequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final subject = request['subject'];
    final stage = request['stage'];
    final status = request['status'];
    final createdAt = request['createdAt'];

    final isActive = status == 'active';
    final date = createdAt != null
        ? DateFormat('dd/MM/yyyy').format(DateTime.parse(createdAt))
        : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? AppColors.primary.withOpacity(0.3)
              : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Subject Icon
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.book,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              // Subject & Stage
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subject?['nameAr'] ?? 'مادة',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    Text(
                      stage?['nameAr'] ?? 'مرحلة',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                    ),
                  ],
                ),
              ),
              // Status Badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: isActive
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.textSecondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isActive ? 'نشط' : 'منتهي',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isActive
                        ? AppColors.success
                        : AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
              // Actions Menu
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20),
                padding: EdgeInsets.zero,
                onSelected: (value) {
                  if (value == 'edit') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تعديل الطلب قريباً')),
                    );
                  } else if (value == 'toggle') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isActive ? 'تم إيقاف الطلب' : 'تم تفعيل الطلب',
                        ),
                      ),
                    );
                  } else if (value == 'delete') {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text(
                          'تأكيد الحذف',
                          style: TextStyle(fontFamily: 'Cairo'),
                        ),
                        content: const Text(
                          'هل تريد حذف هذا الطلب؟',
                          style: TextStyle(fontFamily: 'Cairo'),
                        ),
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
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('تم حذف الطلب')),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.error,
                            ),
                            child: const Text(
                              'حذف',
                              style: TextStyle(
                                fontFamily: 'Cairo',
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit, size: 18, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text('تعديل', style: TextStyle(fontFamily: 'Cairo')),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'toggle',
                    child: Row(
                      children: [
                        Icon(
                          isActive ? Icons.pause : Icons.play_arrow,
                          size: 18,
                          color: isActive ? Colors.orange : AppColors.success,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isActive ? 'إيقاف' : 'تفعيل',
                          style: const TextStyle(fontFamily: 'Cairo'),
                        ),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete, size: 18, color: AppColors.error),
                        SizedBox(width: 8),
                        Text('حذف', style: TextStyle(fontFamily: 'Cairo')),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),
          // Date
          Row(
            children: [
              const Icon(
                Icons.calendar_today,
                size: 14,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                'تاريخ الإنشاء: $date',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  fontFamily: 'Cairo',
                ),
              ),
              const Spacer(),
              // Contact Count
              if (request['contactCount'] != null &&
                  request['contactCount'] > 0)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.person,
                        size: 14,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${request['contactCount']} معلم',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

class _ContactRequestCard extends StatelessWidget {
  final Map<String, dynamic> request;

  const _ContactRequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final teacher = request['teacher'];
    final teacherUser = teacher?['user'] ?? {};
    final status = request['status'];
    final createdAt = request['createdAt'];

    final statusLabel = status == 'pending'
        ? 'قيد الانتظار'
        : status == 'accepted'
            ? 'مقبول'
            : status == 'rejected'
                ? 'مرفوض'
                : status;

    final statusColor = status == 'pending'
        ? Colors.orange
        : status == 'accepted'
            ? Colors.green
            : status == 'rejected'
                ? Colors.red
                : Colors.grey;

    final date = createdAt != null
        ? DateFormat('dd/MM/yyyy').format(DateTime.parse(createdAt))
        : '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: AppColors.primary.withOpacity(0.1),
            backgroundImage: teacherUser['avatarUrl'] != null
                ? NetworkImage(teacherUser['avatarUrl'])
                : null,
            child: teacherUser['avatarUrl'] == null
                ? Text(
                    (teacherUser['name'] ?? 'م')[0],
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  teacherUser['name'] ?? 'معلم',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cairo',
                  ),
                ),
                Text(
                  'تاريخ الطلب: $date',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              statusLabel,
              style: TextStyle(
                fontSize: 12,
                color: statusColor,
                fontWeight: FontWeight.bold,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

