import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/onboarding_repository.dart';

final onboardingRepositoryProvider = Provider<OnboardingRepository>((ref) {
  return OnboardingRepository();
});

final onboardingStateProvider = StateNotifierProvider<OnboardingNotifier, bool>(
  (ref) {
    return OnboardingNotifier(ref.read(onboardingRepositoryProvider));
  },
);

class OnboardingNotifier extends StateNotifier<bool> {
  final OnboardingRepository _repository;

  OnboardingNotifier(this._repository) : super(true) {
    // Default to true to prevent flicker
    checkStatus();
  }

  Future<void> checkStatus() async {
    final isComplete = await _repository.checkIfOnboardingComplete();
    state = isComplete;
  }

  Future<void> completeOnboarding() async {
    await _repository.setOnboardingComplete();
    state = true;
  }
}
