import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';

class FavoritesRepository {
  final DioClient _dioClient = DioClient();

  Dio get _dio => _dioClient.dio;

  /// Get all favorites for current parent
  Future<List<Map<String, dynamic>>> getFavorites() async {
    try {
      final response = await _dio.get('/favorites');
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  /// Add teacher to favorites
  Future<bool> addFavorite(String teacherId) async {
    try {
      final response = await _dio.post(
        '/favorites',
        data: {'teacherId': teacherId},
      );
      return response.data['success'] == true;
    } catch (e) {
      rethrow;
    }
  }

  /// Remove teacher from favorites
  Future<bool> removeFavorite(String teacherId) async {
    try {
      final response = await _dio.delete('/favorites/$teacherId');
      return response.data['success'] == true;
    } catch (e) {
      rethrow;
    }
  }

  /// Check if teacher is in favorites (client-side check)
  bool isFavorite(List<Map<String, dynamic>> favorites, String teacherId) {
    return favorites.any((fav) => fav['teacherId'] == teacherId);
  }
}
