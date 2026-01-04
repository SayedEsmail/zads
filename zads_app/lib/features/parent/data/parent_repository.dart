import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final parentRepositoryProvider = Provider<ParentRepository>((ref) {
  return ParentRepository(ref.read(dioClientProvider).dio);
});

class ParentRepository {
  final Dio _dio;

  ParentRepository(this._dio);

  /// Get parent profile
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/parents/me');
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل البيانات';
    }
  }

  /// Update parent profile
  Future<Map<String, dynamic>> updateProfile({String? areaId}) async {
    try {
      final response = await _dio.put(
        '/parents/me',
        data: {if (areaId != null) 'areaId': areaId},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحديث البيانات';
    }
  }

  /// Get children
  Future<List<dynamic>> getChildren() async {
    try {
      final response = await _dio.get('/parents/me/children');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الأبناء';
    }
  }

  /// Add child
  Future<Map<String, dynamic>> addChild({
    required String name,
    required String stageId,
    List<String>? subjectIds,
  }) async {
    try {
      final response = await _dio.post(
        '/parents/me/children',
        data: {
          'name': name,
          'stageId': stageId,
          if (subjectIds != null) 'subjectIds': subjectIds,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل إضافة الطفل';
    }
  }

  /// Update child
  Future<Map<String, dynamic>> updateChild({
    required String childId,
    String? name,
    String? stageId,
    List<String>? subjectIds,
  }) async {
    try {
      final response = await _dio.put(
        '/parents/me/children/$childId',
        data: {
          if (name != null) 'name': name,
          if (stageId != null) 'stageId': stageId,
          if (subjectIds != null) 'subjectIds': subjectIds,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحديث البيانات';
    }
  }

  /// Delete child
  Future<void> deleteChild(String childId) async {
    try {
      await _dio.delete('/parents/me/children/$childId');
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل حذف الطفل';
    }
  }

  /// Get tutor requests
  Future<List<dynamic>> getTutorRequests() async {
    try {
      final response = await _dio.get('/tutor-requests/my');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الطلبات';
    }
  }
}
