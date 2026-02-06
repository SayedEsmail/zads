import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../teacher/providers/teacher_provider.dart';
import '../../../locations/providers/locations_provider.dart';

class SearchFiltersModal extends ConsumerStatefulWidget {
  final Function({
    String? stageId,
    String? subjectId,
    String? governorateId,
    String? cityId,
    String? areaId,
    int? minPrice,
    int? maxPrice,
  })
  onApply;

  const SearchFiltersModal({super.key, required this.onApply});

  @override
  ConsumerState<SearchFiltersModal> createState() => _SearchFiltersModalState();
}

class _SearchFiltersModalState extends ConsumerState<SearchFiltersModal> {
  String? _selectedStageId;
  String? _selectedSubjectId;
  String? _selectedGovernorateId;
  String? _selectedCityId;
  String? _selectedAreaId;
  final TextEditingController _minPriceController = TextEditingController();
  final TextEditingController _maxPriceController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Refresh providers to ensure data is available
    Future.microtask(() {
      ref.refresh(stagesProvider);
      ref.refresh(subjectsProvider);
      ref.refresh(governoratesProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final stagesAsync = ref.watch(stagesProvider);
    final subjectsAsync = ref.watch(subjectsProvider);
    final governoratesAsync = ref.watch(governoratesProvider);
    final citiesAsync = _selectedGovernorateId != null
        ? ref.watch(citiesProvider(_selectedGovernorateId!))
        : const AsyncValue.data([]);
    final areasAsync = _selectedCityId != null
        ? ref.watch(areasProvider(_selectedCityId!))
        : const AsyncValue.data([]);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        // To handle keyboard overlap
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'تصفية النتائج',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => context.pop(),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 16),

              // Educational Filter
              const Text(
                'المرحلة والمادة',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildDropdown(
                      label: 'المرحلة',
                      value: _selectedStageId,
                      items: stagesAsync.value ?? [],
                      onChanged: (val) =>
                          setState(() => _selectedStageId = val),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildDropdown(
                      label: 'المادة',
                      value: _selectedSubjectId,
                      items: subjectsAsync.value ?? [],
                      onChanged: (val) =>
                          setState(() => _selectedSubjectId = val),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Location Filter
              const Text(
                'الموقع',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 8),
              _buildDropdown(
                label: 'المحافظة',
                value: _selectedGovernorateId,
                items: governoratesAsync.value ?? [],
                onChanged: (val) => setState(() {
                  _selectedGovernorateId = val;
                  _selectedCityId = null;
                  _selectedAreaId = null;
                }),
              ),
              if (_selectedGovernorateId != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildDropdown(
                        label: 'المدينة',
                        value: _selectedCityId,
                        items: citiesAsync.value ?? [],
                        onChanged: (val) => setState(() {
                          _selectedCityId = val;
                          _selectedAreaId = null;
                        }),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildDropdown(
                        label: 'المنطقة',
                        value: _selectedAreaId,
                        items: areasAsync.value ?? [],
                        onChanged: (val) =>
                            setState(() => _selectedAreaId = val),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),

              // Price Filter
              const Text(
                'سعر الحصة',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Cairo',
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _minPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'من (جنية)',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _maxPriceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'إلى (جنية)',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  widget.onApply(
                    stageId: _selectedStageId,
                    subjectId: _selectedSubjectId,
                    governorateId: _selectedGovernorateId,
                    cityId: _selectedCityId,
                    areaId: _selectedAreaId,
                    minPrice: int.tryParse(_minPriceController.text),
                    maxPrice: int.tryParse(_maxPriceController.text),
                  );
                  context.pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'تطبيق الفلتر',
                  style: TextStyle(
                    fontFamily: 'Cairo',
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<dynamic> items,
    required Function(String?) onChanged,
  }) {
    // If the currently selected value is not in the items list, reset it to null used in UI only
    // This prevents the assertion error: "There should be exactly one item with [DropdownButton]'s value: ..."
    final safeValue = items.any((item) => item['id'] == value) ? value : null;

    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontFamily: 'Cairo', fontSize: 14),
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      initialValue: safeValue,
      items: items.map<DropdownMenuItem<String>>((item) {
        return DropdownMenuItem(
          value: item['id'],
          child: Text(
            item['nameAr'] ?? '',
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontFamily: 'Cairo', fontSize: 13),
          ),
        );
      }).toList(),
      onChanged: onChanged,
      isExpanded: true,
    );
  }
}
