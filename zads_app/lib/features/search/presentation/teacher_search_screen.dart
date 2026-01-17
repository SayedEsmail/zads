import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../common/presentation/widgets/teacher_card.dart';
import '../providers/search_provider.dart';
import 'widgets/search_filters_modal.dart';

class TeacherSearchScreen extends ConsumerStatefulWidget {
  const TeacherSearchScreen({super.key});

  @override
  ConsumerState<TeacherSearchScreen> createState() =>
      _TeacherSearchScreenState();
}

class _TeacherSearchScreenState extends ConsumerState<TeacherSearchScreen> {
  final ScrollController _scrollController = ScrollController();

  // Active Filters state for UI display
  String? _selectedStageId;
  String? _selectedSubjectId;
  String? _selectedGovernorateId;
  String? _selectedCityId;
  String? _selectedAreaId;
  int? _minPrice;
  int? _maxPrice;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Initial search if empty
    Future.microtask(() {
      final state = ref.read(teacherSearchProvider);
      if (state.teachers.isEmpty && !state.isLoading) {
        ref.read(teacherSearchProvider.notifier).searchTeachers();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref
          .read(teacherSearchProvider.notifier)
          .loadMore(
            stageId: _selectedStageId,
            subjectId: _selectedSubjectId,
            governorateId: _selectedGovernorateId,
            cityId: _selectedCityId,
            areaId: _selectedAreaId,
          );
    }
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SearchFiltersModal(
        onApply:
            ({
              stageId,
              subjectId,
              governorateId,
              cityId,
              areaId,
              minPrice,
              maxPrice,
            }) {
              setState(() {
                _selectedStageId = stageId;
                _selectedSubjectId = subjectId;
                _selectedGovernorateId = governorateId;
                _selectedCityId = cityId;
                _selectedAreaId = areaId;
                _minPrice = minPrice;
                _maxPrice = maxPrice;
              });

              ref
                  .read(teacherSearchProvider.notifier)
                  .searchTeachers(
                    stageId: stageId,
                    subjectId: subjectId,
                    governorateId: governorateId,
                    cityId: cityId,
                    areaId: areaId,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                  );
            },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(teacherSearchProvider);

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
          'البحث عن المعلمين',
          style: TextStyle(
            color: Colors.black,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.filter_list, color: Colors.black),
                if (_hasActiveFilters)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: _showFilters,
          ),
        ],
      ),
      body: Column(
        children: [
          // Loading Indicator
          if (searchState.isLoading && searchState.teachers.isEmpty)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          // Error State
          else if (searchState.error != null && searchState.teachers.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      searchState.error!,
                      style: const TextStyle(fontFamily: 'Cairo'),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref
                          .read(teacherSearchProvider.notifier)
                          .searchTeachers(
                            stageId: _selectedStageId,
                            subjectId: _selectedSubjectId,
                            governorateId: _selectedGovernorateId,
                            cityId: _selectedCityId,
                            areaId: _selectedAreaId,
                          ),
                      child: const Text(
                        'إعادة المحاولة',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                    ),
                  ],
                ),
              ),
            )
          // Empty State
          else if (searchState.teachers.isEmpty)
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.search_off, size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      'لا توجد نتائج مطابقة لبحثك',
                      style: TextStyle(
                        fontFamily: 'Cairo',
                        color: Colors.grey,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            )
          // List
          else
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount:
                    searchState.teachers.length +
                    (searchState.isLoading ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == searchState.teachers.length) {
                    return const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: AppColors.primary,
                        ),
                      ),
                    );
                  }
                  return TeacherCard(teacher: searchState.teachers[index]);
                },
              ),
            ),
        ],
      ),
    );
  }

  bool get _hasActiveFilters =>
      _selectedStageId != null ||
      _selectedSubjectId != null ||
      _selectedGovernorateId != null ||
      _selectedCityId != null ||
      _selectedAreaId != null ||
      _minPrice != null ||
      _maxPrice != null;
}
