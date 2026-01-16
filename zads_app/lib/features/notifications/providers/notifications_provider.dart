import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/notifications_repository.dart';

class NotificationsState {
  final bool isLoading;
  final String? error;
  final List<Map<String, dynamic>> notifications;

  NotificationsState({
    this.isLoading = false,
    this.error,
    this.notifications = const [],
  });

  NotificationsState copyWith({
    bool? isLoading,
    String? error,
    List<Map<String, dynamic>>? notifications,
  }) {
    return NotificationsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      notifications: notifications ?? this.notifications,
    );
  }

  int get unreadCount =>
      notifications.where((n) => n['isRead'] == false).length;
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
      return NotificationsNotifier(ref.read(notificationsRepositoryProvider));
    });

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationsRepository _repository;

  NotificationsNotifier(this._repository) : super(NotificationsState());

  Future<void> loadNotifications() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final notifications = await _repository.getNotifications();
      state = state.copyWith(isLoading: false, notifications: notifications);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _repository.markAsRead(notificationId);
      final updatedNotifications = state.notifications.map((n) {
        if (n['id'] == notificationId) {
          return {...n, 'isRead': true};
        }
        return n;
      }).toList();
      state = state.copyWith(notifications: updatedNotifications);
    } catch (e) {
      // Ignore error for visual update or handle it
    }
  }

  Future<void> markAllAsRead() async {
    // Mock implementation for mark all as read
    final updatedNotifications = state.notifications.map((n) {
      return {...n, 'isRead': true};
    }).toList();
    state = state.copyWith(notifications: updatedNotifications);
  }
}
