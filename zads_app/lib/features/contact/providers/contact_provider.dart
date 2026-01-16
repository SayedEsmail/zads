import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/contact_repository.dart';

// State for sending a contact request
class ContactRequestState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  ContactRequestState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
  });

  ContactRequestState copyWith({
    bool? isLoading,
    String? error,
    bool? isSuccess,
  }) {
    return ContactRequestState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
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
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  void reset() {
    state = ContactRequestState();
  }
}
