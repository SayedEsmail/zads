import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/locations_repository.dart';

// Governorates Provider
final governoratesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.read(locationsRepositoryProvider);
  return repository.getGovernorates();
});

// Cities Provider (depends on selected governorate)
final citiesProvider = FutureProvider.family<List<dynamic>, String?>((
  ref,
  governorateId,
) async {
  if (governorateId == null || governorateId.isEmpty) {
    return [];
  }
  final repository = ref.read(locationsRepositoryProvider);
  return repository.getCitiesByGovernorate(governorateId);
});

// Areas Provider (depends on selected city)
final areasProvider = FutureProvider.family<List<dynamic>, String?>((
  ref,
  cityId,
) async {
  if (cityId == null || cityId.isEmpty) {
    return [];
  }
  final repository = ref.read(locationsRepositoryProvider);
  return repository.getAreasByCity(cityId);
});

// Selected Location State
class LocationSelection {
  final String? governorateId;
  final String? cityId;
  final String? areaId;

  const LocationSelection({this.governorateId, this.cityId, this.areaId});

  LocationSelection copyWith({
    String? governorateId,
    String? cityId,
    String? areaId,
    bool clearCity = false,
    bool clearArea = false,
  }) {
    return LocationSelection(
      governorateId: governorateId ?? this.governorateId,
      cityId: clearCity ? null : (cityId ?? this.cityId),
      areaId: clearArea ? null : (areaId ?? this.areaId),
    );
  }
}

class LocationSelectionNotifier extends StateNotifier<LocationSelection> {
  LocationSelectionNotifier() : super(const LocationSelection());

  void setGovernorate(String? id) {
    state = state.copyWith(governorateId: id, clearCity: true, clearArea: true);
  }

  void setCity(String? id) {
    state = state.copyWith(cityId: id, clearArea: true);
  }

  void setArea(String? id) {
    state = state.copyWith(areaId: id);
  }

  void reset() {
    state = const LocationSelection();
  }

  void initFromProfile(String? areaId, String? cityId, String? governorateId) {
    state = LocationSelection(
      governorateId: governorateId,
      cityId: cityId,
      areaId: areaId,
    );
  }
}

final locationSelectionProvider =
    StateNotifierProvider<LocationSelectionNotifier, LocationSelection>((ref) {
      return LocationSelectionNotifier();
    });
