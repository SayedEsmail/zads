import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/favorites_repository.dart';

// Repository provider
final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  return FavoritesRepository();
});

// Favorites state
class FavoritesState {
  final List<Map<String, dynamic>> favorites;
  final Set<String> favoriteTeacherIds;
  final bool isLoading;
  final String? error;

  FavoritesState({
    this.favorites = const [],
    this.favoriteTeacherIds = const {},
    this.isLoading = false,
    this.error,
  });

  FavoritesState copyWith({
    List<Map<String, dynamic>>? favorites,
    Set<String>? favoriteTeacherIds,
    bool? isLoading,
    String? error,
  }) {
    return FavoritesState(
      favorites: favorites ?? this.favorites,
      favoriteTeacherIds: favoriteTeacherIds ?? this.favoriteTeacherIds,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  bool isFavorite(String teacherId) => favoriteTeacherIds.contains(teacherId);
}

// Favorites notifier
class FavoritesNotifier extends StateNotifier<FavoritesState> {
  final FavoritesRepository _repository;

  FavoritesNotifier(this._repository) : super(FavoritesState());

  Future<void> loadFavorites() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final favorites = await _repository.getFavorites();
      final teacherIds = favorites
          .map((fav) => fav['teacherId'] as String?)
          .where((id) => id != null)
          .cast<String>()
          .toSet();

      state = state.copyWith(
        favorites: favorites,
        favoriteTeacherIds: teacherIds,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> toggleFavorite(String teacherId) async {
    final isFavorite = state.isFavorite(teacherId);

    // Optimistic update
    final newIds = Set<String>.from(state.favoriteTeacherIds);
    if (isFavorite) {
      newIds.remove(teacherId);
    } else {
      newIds.add(teacherId);
    }
    state = state.copyWith(favoriteTeacherIds: newIds);

    try {
      bool success;
      if (isFavorite) {
        success = await _repository.removeFavorite(teacherId);
      } else {
        success = await _repository.addFavorite(teacherId);
      }

      if (success) {
        // Reload full favorites list to get updated data
        await loadFavorites();
      } else {
        // Revert on failure
        final revertIds = Set<String>.from(state.favoriteTeacherIds);
        if (isFavorite) {
          revertIds.add(teacherId);
        } else {
          revertIds.remove(teacherId);
        }
        state = state.copyWith(favoriteTeacherIds: revertIds);
      }
      return success;
    } catch (e) {
      // Revert on error
      final revertIds = Set<String>.from(state.favoriteTeacherIds);
      if (isFavorite) {
        revertIds.add(teacherId);
      } else {
        revertIds.remove(teacherId);
      }
      state = state.copyWith(
        favoriteTeacherIds: revertIds,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> addToFavorites(String teacherId) async {
    if (state.isFavorite(teacherId)) return true;
    return toggleFavorite(teacherId);
  }

  Future<bool> removeFromFavorites(String teacherId) async {
    if (!state.isFavorite(teacherId)) return true;
    return toggleFavorite(teacherId);
  }
}

// Provider
final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, FavoritesState>((ref) {
      final repository = ref.watch(favoritesRepositoryProvider);
      return FavoritesNotifier(repository);
    });
