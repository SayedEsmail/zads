import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final teacherRepositoryProvider = Provider<TeacherRepository>((ref) {
  return TeacherRepository(ref.read(dioClientProvider).dio);
});

class TeacherRepository {
  final Dio _dio;

  TeacherRepository(this._dio);

  /// Get teacher profile
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/teachers/me');
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل البيانات';
    }
  }

  /// Update teacher profile
  Future<Map<String, dynamic>> updateProfile({
    String? bio,
    int? experienceYears,
    String? qualification,
    String? areaId,
    List<String>? lessonTypes,
  }) async {
    try {
      final response = await _dio.put(
        '/teachers/me',
        data: {
          if (bio != null) 'bio': bio,
          if (experienceYears != null) 'experienceYears': experienceYears,
          if (qualification != null) 'qualification': qualification,
          if (areaId != null) 'areaId': areaId,
          if (lessonTypes != null) 'lessonTypes': lessonTypes,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحديث البيانات';
    }
  }

  /// Get all subjects
  Future<List<dynamic>> getSubjects() async {
    try {
      final response = await _dio.get('/subjects');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المواد';
    }
  }

  /// Get all stages
  Future<List<dynamic>> getStages() async {
    try {
      final response = await _dio.get('/stages');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المراحل';
    }
  }

  /// Get teacher subjects
  Future<List<dynamic>> getTeacherSubjects() async {
    try {
      final response = await _dio.get('/teachers/me/subjects');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المواد';
    }
  }

  /// Add subject to teacher
  Future<Map<String, dynamic>> addSubject({
    required String subjectId,
    required String stageId,
    int? priceAtTeacher,
    int? priceAtStudent,
    int? priceGroup,
    int? durationMinutes,
  }) async {
    try {
      final response = await _dio.post(
        '/teachers/me/subjects',
        data: {
          'subjectId': subjectId,
          'stageId': stageId,
          if (priceAtTeacher != null) 'priceAtTeacher': priceAtTeacher,
          if (priceAtStudent != null) 'priceAtStudent': priceAtStudent,
          if (priceGroup != null) 'priceGroup': priceGroup,
          if (durationMinutes != null) 'durationMinutes': durationMinutes,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل إضافة المادة';
    }
  }

  /// Update subject
  Future<Map<String, dynamic>> updateSubject({
    required String teacherSubjectId,
    int? priceAtTeacher,
    int? priceAtStudent,
    int? priceGroup,
    int? durationMinutes,
  }) async {
    try {
      final response = await _dio.put(
        '/teachers/me/subjects/$teacherSubjectId',
        data: {
          if (priceAtTeacher != null) 'priceAtTeacher': priceAtTeacher,
          if (priceAtStudent != null) 'priceAtStudent': priceAtStudent,
          if (priceGroup != null) 'priceGroup': priceGroup,
          if (durationMinutes != null) 'durationMinutes': durationMinutes,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحديث المادة';
    }
  }

  /// Delete subject
  Future<void> deleteSubject(String teacherSubjectId) async {
    try {
      await _dio.delete('/teachers/me/subjects/$teacherSubjectId');
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل حذف المادة';
    }
  }

  /// Get tutor requests (jobs)
  Future<List<dynamic>> getTutorRequests({
    String? subjectId,
    String? stageId,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final response = await _dio.get(
        '/tutor-requests',
        queryParameters: {
          if (subjectId != null) 'subjectId': subjectId,
          if (stageId != null) 'stageId': stageId,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
        },
      );
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الطلبات المتاحة';
    }
  }
}
