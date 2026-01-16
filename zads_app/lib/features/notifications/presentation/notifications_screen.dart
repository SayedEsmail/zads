import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(notificationsProvider.notifier).loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'الإشعارات',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (state.notifications.isNotEmpty)
            TextButton(
              onPressed: () {
                ref.read(notificationsProvider.notifier).markAllAsRead();
              },
              child: const Text(
                'تحديد الكل كمقروء',
                style: TextStyle(
                  color: Colors.white,
                  fontFamily: 'Cairo',
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
      body: state.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : state.notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: 64,
                    color: AppColors.textSecondary.withOpacity(0.5),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'لا توجد إشعارات حالياً',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.notifications.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final notification = state.notifications[index];
                return _NotificationItem(notification: notification);
              },
            ),
    );
  }
}

class _NotificationItem extends ConsumerWidget {
  final Map<String, dynamic> notification;

  const _NotificationItem({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isRead = notification['isRead'] == true;
    final type = notification['type'];
    final createdAt = notification['createdAt'];

    // Format date
    String dateStr = '';
    if (createdAt != null) {
      final date = DateTime.parse(createdAt);
      dateStr = DateFormat('dd/MM/yyyy hh:mm a').format(date);
    }

    IconData icon;
    Color iconColor;

    switch (type) {
      case 'contact_accepted':
        icon = Icons.check_circle_outline;
        iconColor = Colors.green;
        break;
      case 'welcome':
        icon = Icons.celebration;
        iconColor = Colors.orange;
        break;
      case 'lesson_reminder':
        icon = Icons.access_time;
        iconColor = AppColors.primary;
        break;
      default:
        icon = Icons.notifications_none;
        iconColor = Colors.grey;
    }

    return GestureDetector(
      onTap: () {
        if (!isRead) {
          ref
              .read(notificationsProvider.notifier)
              .markAsRead(notification['id']);
        }
        // Handle navigation based on type if needed
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? Colors.white : AppColors.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isRead
                ? Colors.transparent
                : AppColors.primary.withOpacity(0.2),
          ),
          boxShadow: [
            if (isRead)
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 5,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'] ?? '',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isRead
                                ? FontWeight.normal
                                : FontWeight.bold,
                            fontFamily: 'Cairo',
                          ),
                        ),
                      ),
                      if (!isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification['body'] ?? '',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                      fontWeight: isRead ? FontWeight.normal : FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    dateStr,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.grey,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
