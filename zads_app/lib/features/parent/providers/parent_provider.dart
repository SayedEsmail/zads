import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/parent_repository.dart';

// State for parent profile
class ParentProfileState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? profile;

  ParentProfileState({this.isLoading = false, this.error, this.profile});

  ParentProfileState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? profile,
  }) {
    return ParentProfileState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      profile: profile ?? this.profile,
    );
  }
}

final parentProfileProvider =
    StateNotifierProvider<ParentProfileNotifier, ParentProfileState>((ref) {
      return ParentProfileNotifier(ref.read(parentRepositoryProvider));
    });

class ParentProfileNotifier extends StateNotifier<ParentProfileState> {
  final ParentRepository _repository;

  ParentProfileNotifier(this._repository) : super(ParentProfileState());

  /// Load parent profile
  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.getProfile();
      // API returns { data: { parent: {...} } }
      final profile = response['data']?['parent'] ?? response['data'];

      state = state.copyWith(isLoading: false, profile: profile);
    } catch (e) {
      print('❌ Load Parent Profile Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Update profile
  Future<bool> updateProfile({String? areaId}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.updateProfile(areaId: areaId);
      // Reload profile
      await loadProfile();
      return true;
    } catch (e) {
      print('❌ Update Parent Profile Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

// State for parent children
class ParentChildrenState {
  final bool isLoading;
  final String? error;
  final List<dynamic> children;

  ParentChildrenState({
    this.isLoading = false,
    this.error,
    this.children = const [],
  });

  ParentChildrenState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? children,
  }) {
    return ParentChildrenState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      children: children ?? this.children,
    );
  }
}

final parentChildrenProvider =
    StateNotifierProvider<ParentChildrenNotifier, ParentChildrenState>((ref) {
      return ParentChildrenNotifier(ref.read(parentRepositoryProvider));
    });

class ParentChildrenNotifier extends StateNotifier<ParentChildrenState> {
  final ParentRepository _repository;

  ParentChildrenNotifier(this._repository) : super(ParentChildrenState());

  /// Load children
  Future<void> loadChildren() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final children = await _repository.getChildren();
      state = state.copyWith(isLoading: false, children: children);
    } catch (e) {
      print('❌ Load Children Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Add child
  Future<bool> addChild({
    required String name,
    required String stageId,
    List<String>? subjectIds,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.addChild(
        name: name,
        stageId: stageId,
        subjectIds: subjectIds,
      );
      await loadChildren();
      return true;
    } catch (e) {
      print('❌ Add Child Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Update child
  Future<bool> updateChild({
    required String childId,
    String? name,
    String? stageId,
    List<String>? subjectIds,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.updateChild(
        childId: childId,
        name: name,
        stageId: stageId,
        subjectIds: subjectIds,
      );
      await loadChildren();
      return true;
    } catch (e) {
      print('❌ Update Child Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Delete child
  Future<bool> deleteChild(String childId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.deleteChild(childId);
      await loadChildren();
      return true;
    } catch (e) {
      print('❌ Delete Child Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

// State for tutor requests
class TutorRequestsState {
  final bool isLoading;
  final String? error;
  final List<dynamic> requests;

  TutorRequestsState({
    this.isLoading = false,
    this.error,
    this.requests = const [],
  });

  TutorRequestsState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? requests,
  }) {
    return TutorRequestsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      requests: requests ?? this.requests,
    );
  }
}

final tutorRequestsProvider =
    StateNotifierProvider<TutorRequestsNotifier, TutorRequestsState>((ref) {
      return TutorRequestsNotifier(ref.read(parentRepositoryProvider));
    });

class TutorRequestsNotifier extends StateNotifier<TutorRequestsState> {
  final ParentRepository _repository;

  TutorRequestsNotifier(this._repository) : super(TutorRequestsState());

  /// Load tutor requests
  Future<void> loadRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final requests = await _repository.getTutorRequests();
      state = state.copyWith(isLoading: false, requests: requests);
    } catch (e) {
      print('❌ Load Tutor Requests Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
