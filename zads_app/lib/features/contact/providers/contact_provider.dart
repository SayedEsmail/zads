import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/contact_repository.dart';

// State for sending a contact request
class ContactRequestState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;
  final List<dynamic> requests;

  ContactRequestState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
    this.requests = const [],
  });

  ContactRequestState copyWith({
    bool? isLoading,
    String? error,
    bool? isSuccess,
    List<dynamic>? requests,
  }) {
    return ContactRequestState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
      requests: requests ?? this.requests,
    );
  }
}

final contactProvider =
    StateNotifierProvider<ContactNotifier, ContactRequestState>((ref) {
      return ContactNotifier(ref.read(contactRepositoryProvider));
    });

class ContactNotifier extends StateNotifier<ContactRequestState> {
  final ContactRepository _repository;

  ContactNotifier(this._repository) : super(ContactRequestState());

  Future<bool> sendContactRequest(String teacherId) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);
    try {
      await _repository.createContactRequest(teacherId);
      state = state.copyWith(isLoading: false, isSuccess: true);
      // Reload requests after sending a new one (optional)
      loadOutgoingRequests();
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> loadOutgoingRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final requests = await _repository.getOutgoingRequests();
      state = state.copyWith(isLoading: false, requests: requests);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadIncomingRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final requests = await _repository.getIncomingRequests();
      state = state.copyWith(isLoading: false, requests: requests);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void reset() {
    state = ContactRequestState();
  }
}
