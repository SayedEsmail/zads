import 'package:flutter_riverpod/flutter_riverpod.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((
  ref,
) {
  return NotificationsRepository();
});

class NotificationsRepository {
  /// Simulate fetching notifications from API
  Future<List<Map<String, dynamic>>> getNotifications() async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Return dummy data
    return [
      {
        'id': '1',
        'title': 'تم قبول طلب التواصل',
        'body':
            'وافق المعلم أحمد محمد على طلب التواصل الخاص بك. يمكنك الآن رؤية رقم هاتفه.',
        'type': 'contact_accepted',
        'isRead': false,
        'createdAt': DateTime.now()
            .subtract(const Duration(minutes: 5))
            .toIso8601String(),
        'data': {'teacherId': '1'},
      },
      {
        'id': '2',
        'title': 'مرحباً بك في زاد',
        'body': 'نتمنى لك تجربة تعليمية مميزة مع نخبة من أفضل المعلمين.',
        'type': 'welcome',
        'isRead': true,
        'createdAt': DateTime.now()
            .subtract(const Duration(days: 1))
            .toIso8601String(),
        'data': null,
      },
      {
        'id': '3',
        'title': 'تذكير بموعد الدرس',
        'body': 'لديك درس لغة عربية غداً الساعة ٥ مساءً.',
        'type': 'lesson_reminder',
        'isRead': true,
        'createdAt': DateTime.now()
            .subtract(const Duration(days: 2))
            .toIso8601String(),
        'data': {'requestId': '123'},
      },
    ];
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // In a real app, this would call the API
  }
}
