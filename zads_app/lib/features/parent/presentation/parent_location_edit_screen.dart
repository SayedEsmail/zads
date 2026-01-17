import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../locations/providers/locations_provider.dart';
import '../providers/parent_provider.dart';

class ParentLocationEditScreen extends ConsumerStatefulWidget {
  const ParentLocationEditScreen({super.key});

  @override
  ConsumerState<ParentLocationEditScreen> createState() =>
      _ParentLocationEditScreenState();
}

class _ParentLocationEditScreenState
    extends ConsumerState<ParentLocationEditScreen> {
  String? selectedGovernorateId;
  String? selectedCityId;
  String? selectedAreaId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.refresh(governoratesProvider);
      ref.read(parentProfileProvider.notifier).loadProfile();
    });
  }

  void _loadProfile() {
    final profile = ref.read(parentProfileProvider).profile;
    if (profile != null) {
      final area = profile['area'];
      final city = area?['city'];
      final governorate = city?['governorate'];

      setState(() {
        selectedAreaId = area?['id'];
        selectedCityId = city?['id'];
        selectedGovernorateId = governorate?['id'];
      });

      if (selectedGovernorateId != null) {
        ref.refresh(citiesProvider(selectedGovernorateId));
      }
      if (selectedCityId != null) {
        ref.refresh(areasProvider(selectedCityId));
      }
    }
  }

  Future<void> _saveLocation() async {
    if (selectedAreaId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('يرجى اختيار المنطقة')));
      return;
    }

    await ref
        .read(parentProfileProvider.notifier)
        .updateProfile(areaId: selectedAreaId);

    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('تم حفظ الموقع بنجاح')));
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(parentProfileProvider);
    final governoratesAsync = ref.watch(governoratesProvider);
    final citiesAsync = selectedGovernorateId != null
        ? ref.watch(citiesProvider(selectedGovernorateId!))
        : const AsyncValue.data([]);
    final areasAsync = selectedCityId != null
        ? ref.watch(areasProvider(selectedCityId!))
        : const AsyncValue.data([]);

    // Load profile data when available
    ref.listen<ParentProfileState>(parentProfileProvider, (prev, next) {
      if (prev?.profile == null && next.profile != null) {
        _loadProfile();
      }
    });

    // Load profile immediately if already available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (profileState.profile != null &&
          selectedGovernorateId == null &&
          selectedCityId == null &&
          selectedAreaId == null) {
        _loadProfile();
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'تعديل الموقع',
          style: TextStyle(
            color: Colors.black,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: profileState.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'اختر موقعك للبحث عن المعلمين القريبين منك',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.primary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Governorate Dropdown
                  const Text(
                    'المحافظة',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  governoratesAsync.when(
                    data: (governorates) => _buildDropdown(
                      value: selectedGovernorateId,
                      items: governorates,
                      hint: 'اختر المحافظة',
                      onChanged: (value) {
                        setState(() {
                          selectedGovernorateId = value;
                          selectedCityId = null;
                          selectedAreaId = null;
                        });
                        if (value != null) {
                          ref.refresh(citiesProvider(value));
                        }
                      },
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (err, stack) => Text('خطأ: $err'),
                  ),

                  const SizedBox(height: 16),

                  // City Dropdown
                  const Text(
                    'المدينة',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  citiesAsync.when(
                    data: (cities) => _buildDropdown(
                      value: selectedCityId,
                      items: cities,
                      hint: 'اختر المدينة',
                      enabled: selectedGovernorateId != null,
                      onChanged: (value) {
                        setState(() {
                          selectedCityId = value;
                          selectedAreaId = null;
                        });
                        if (value != null) {
                          ref.refresh(areasProvider(value));
                        }
                      },
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (err, stack) => Text('خطأ: $err'),
                  ),

                  const SizedBox(height: 16),

                  // Area Dropdown
                  const Text(
                    'الحي',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  areasAsync.when(
                    data: (areas) => _buildDropdown(
                      value: selectedAreaId,
                      items: areas,
                      hint: 'اختر الحي',
                      enabled: selectedCityId != null,
                      onChanged: (value) {
                        setState(() {
                          selectedAreaId = value;
                        });
                      },
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (err, stack) => Text('خطأ: $err'),
                  ),

                  const SizedBox(height: 24),

                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveLocation,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'حفظ الموقع',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'Cairo',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildDropdown({
    required String? value,
    required List<dynamic> items,
    required String hint,
    required ValueChanged<String?>? onChanged,
    bool enabled = true,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: enabled ? Colors.white : Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          hint: Text(
            hint,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
          items: items.map<DropdownMenuItem<String>>((item) {
            return DropdownMenuItem<String>(
              value: item['id'],
              child: Text(
                item['nameAr'] ?? '',
                style: const TextStyle(fontFamily: 'Cairo'),
              ),
            );
          }).toList(),
          onChanged: enabled ? onChanged : null,
        ),
      ),
    );
  }
}
