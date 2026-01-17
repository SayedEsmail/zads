import 'dart:developer';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static FirebaseMessaging? _firebaseMessaging;

  static Future<void> initialize() async {
    try {
      // 1. Initialize Firebase Core
      // Note: For Web, we ideally need options. If lacking, this might fail unless auto-config is used.
      // We diligently try to init. If it fails (e.g. no options), we catch it.
      if (Firebase.apps.isEmpty) {
        try {
          await Firebase.initializeApp();
        } catch (e) {
          log(
            "Warning: Firebase.initializeApp failed (likely missing options): $e",
          );
          if (kIsWeb) return; // On web, we can't proceed without init
        }
      }

      _firebaseMessaging = FirebaseMessaging.instance;

      // 2. Request permission
      NotificationSettings settings = await _firebaseMessaging!
          .requestPermission(alert: true, badge: true, sound: true);

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        log('User granted permission');
      } else {
        log('User declined or has not accepted permission');
      }

      // 3. Handle background messages
      // On Web, background messages are handled by SW, this helper might throw or be no-op.
      if (!kIsWeb) {
        FirebaseMessaging.onBackgroundMessage(
          _firebaseMessagingBackgroundHandler,
        );
      }

      // 4. Foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        log('Got a message whilst in the foreground!');
        log('Message data: ${message.data}');

        if (message.notification != null) {
          log('Message also contained a notification: ${message.notification}');
        }
      });

      // Print token for debugging
      await getToken();
    } catch (e) {
      log("Error initializing NotificationService: $e");
    }
  }

  static Future<String?> getToken() async {
    if (_firebaseMessaging == null) return null;
    try {
      String? token = await _firebaseMessaging!.getToken();
      print("🔥 FCM Token: $token");
      return token;
    } catch (e) {
      log("Error getting FCM token: $e");
      return null;
    }
  }
}

// Top-level function for background handling
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Ensure firebase is initialized
  await Firebase.initializeApp();
  log("Handling a background message: ${message.messageId}");
}
