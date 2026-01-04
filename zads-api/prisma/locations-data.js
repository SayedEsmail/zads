// Egyptian Locations Data for Seeding
// Structure: Governorate -> City -> Area

const locationsData = [
    // Cairo Governorate
    {
        name: { en: 'Cairo', ar: 'القاهرة' },
        cities: [
            {
                name: { en: 'Nasr City', ar: 'مدينة نصر' }, areas: [
                    { name: { en: 'Nasr City District 1', ar: 'مدينة نصر حي ١' } },
                    { name: { en: 'Nasr City District 8', ar: 'مدينة نصر حي ٨' } },
                    { name: { en: 'Abbas El Akkad', ar: 'عباس العقاد' } },
                    { name: { en: 'El Hay El Asher', ar: 'الحي العاشر' } },
                ]
            },
            {
                name: { en: 'Heliopolis', ar: 'مصر الجديدة' }, areas: [
                    { name: { en: 'Korba', ar: 'كوربة' } },
                    { name: { en: 'Roxy', ar: 'روكسي' } },
                    { name: { en: 'Sheraton', ar: 'شيراتون' } },
                    { name: { en: 'El Nozha', ar: 'النزهة' } },
                ]
            },
            {
                name: { en: 'Maadi', ar: 'المعادي' }, areas: [
                    { name: { en: 'Maadi Sarayat', ar: 'المعادي السرايات' } },
                    { name: { en: 'Degla', ar: 'دجلة' } },
                    { name: { en: 'Zahraa El Maadi', ar: 'زهراء المعادي' } },
                ]
            },
            {
                name: { en: 'New Cairo', ar: 'القاهرة الجديدة' }, areas: [
                    { name: { en: 'Fifth Settlement', ar: 'التجمع الخامس' } },
                    { name: { en: 'First Settlement', ar: 'التجمع الأول' } },
                    { name: { en: 'Rehab City', ar: 'مدينة الرحاب' } },
                    { name: { en: 'Madinaty', ar: 'مدينتي' } },
                ]
            },
            {
                name: { en: 'Zamalek', ar: 'الزمالك' }, areas: [
                    { name: { en: 'Zamalek North', ar: 'الزمالك الشمالي' } },
                    { name: { en: 'Zamalek South', ar: 'الزمالك الجنوبي' } },
                ]
            },
            {
                name: { en: 'Downtown', ar: 'وسط البلد' }, areas: [
                    { name: { en: 'Tahrir Square', ar: 'ميدان التحرير' } },
                    { name: { en: 'Talaat Harb', ar: 'طلعت حرب' } },
                ]
            },
            {
                name: { en: 'Shoubra', ar: 'شبرا' }, areas: [
                    { name: { en: 'Shoubra El Kheima', ar: 'شبرا الخيمة' } },
                    { name: { en: 'Rod El Farag', ar: 'روض الفرج' } },
                ]
            },
        ]
    },
    // Giza Governorate
    {
        name: { en: 'Giza', ar: 'الجيزة' },
        cities: [
            {
                name: { en: 'Giza City', ar: 'مدينة الجيزة' }, areas: [
                    { name: { en: 'Giza Square', ar: 'ميدان الجيزة' } },
                    { name: { en: 'Pyramids', ar: 'الأهرام' } },
                    { name: { en: 'El Haram', ar: 'الهرم' } },
                ]
            },
            {
                name: { en: '6th of October', ar: '6 أكتوبر' }, areas: [
                    { name: { en: '1st District', ar: 'الحي الأول' } },
                    { name: { en: '2nd District', ar: 'الحي الثاني' } },
                    { name: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' } },
                ]
            },
            {
                name: { en: 'Mohandessin', ar: 'المهندسين' }, areas: [
                    { name: { en: 'Gameat El Dowal', ar: 'جامعة الدول' } },
                    { name: { en: 'Lebanon Square', ar: 'ميدان لبنان' } },
                ]
            },
            {
                name: { en: 'Dokki', ar: 'الدقي' }, areas: [
                    { name: { en: 'Dokki Square', ar: 'ميدان الدقي' } },
                    { name: { en: 'Mesaha', ar: 'المساحة' } },
                ]
            },
            {
                name: { en: 'Faisal', ar: 'فيصل' }, areas: [
                    { name: { en: 'Faisal Main', ar: 'فيصل الرئيسي' } },
                    { name: { en: 'Talbia', ar: 'الطالبية' } },
                ]
            },
        ]
    },
    // Alexandria Governorate
    {
        name: { en: 'Alexandria', ar: 'الإسكندرية' },
        cities: [
            {
                name: { en: 'Alexandria City', ar: 'مدينة الإسكندرية' }, areas: [
                    { name: { en: 'Sidi Gaber', ar: 'سيدي جابر' } },
                    { name: { en: 'Sporting', ar: 'سبورتنج' } },
                    { name: { en: 'Stanley', ar: 'ستانلي' } },
                    { name: { en: 'Raml Station', ar: 'محطة الرمل' } },
                ]
            },
            {
                name: { en: 'Smouha', ar: 'سموحة' }, areas: [
                    { name: { en: 'Smouha Central', ar: 'سموحة المركزية' } },
                    { name: { en: 'Laurent', ar: 'لوران' } },
                ]
            },
            {
                name: { en: 'Montaza', ar: 'المنتزه' }, areas: [
                    { name: { en: 'Mandara', ar: 'المندرة' } },
                    { name: { en: 'Sidi Bishr', ar: 'سيدي بشر' } },
                ]
            },
            {
                name: { en: 'Miami', ar: 'ميامي' }, areas: [
                    { name: { en: 'Miami Beach', ar: 'شاطئ ميامي' } },
                    { name: { en: 'Asafra', ar: 'العصافرة' } },
                ]
            },
        ]
    },
    // Dakahlia Governorate
    {
        name: { en: 'Dakahlia', ar: 'الدقهلية' },
        cities: [
            {
                name: { en: 'Mansoura', ar: 'المنصورة' }, areas: [
                    { name: { en: 'Mansoura Center', ar: 'المنصورة المركز' } },
                    { name: { en: 'Gehan', ar: 'جيهان' } },
                    { name: { en: 'Turiel', ar: 'طوريل' } },
                ]
            },
            {
                name: { en: 'Talkha', ar: 'طلخا' }, areas: [
                    { name: { en: 'Talkha City', ar: 'مدينة طلخا' } },
                ]
            },
            {
                name: { en: 'Mit Ghamr', ar: 'ميت غمر' }, areas: [
                    { name: { en: 'Mit Ghamr City', ar: 'مدينة ميت غمر' } },
                ]
            },
        ]
    },
    // Sharqia Governorate
    {
        name: { en: 'Sharqia', ar: 'الشرقية' },
        cities: [
            {
                name: { en: 'Zagazig', ar: 'الزقازيق' }, areas: [
                    { name: { en: 'Zagazig Center', ar: 'الزقازيق المركز' } },
                ]
            },
            {
                name: { en: '10th of Ramadan', ar: 'العاشر من رمضان' }, areas: [
                    { name: { en: '1st District', ar: 'الحي الأول' } },
                    { name: { en: '2nd District', ar: 'الحي الثاني' } },
                ]
            },
        ]
    },
    // Gharbia Governorate
    {
        name: { en: 'Gharbia', ar: 'الغربية' },
        cities: [
            {
                name: { en: 'Tanta', ar: 'طنطا' }, areas: [
                    { name: { en: 'Tanta Center', ar: 'طنطا المركز' } },
                ]
            },
            {
                name: { en: 'Mahalla El Kubra', ar: 'المحلة الكبرى' }, areas: [
                    { name: { en: 'Mahalla City', ar: 'مدينة المحلة' } },
                ]
            },
        ]
    },
    // Qalyubia Governorate
    {
        name: { en: 'Qalyubia', ar: 'القليوبية' },
        cities: [
            {
                name: { en: 'Banha', ar: 'بنها' }, areas: [
                    { name: { en: 'Banha Center', ar: 'بنها المركز' } },
                ]
            },
            {
                name: { en: 'Obour City', ar: 'مدينة العبور' }, areas: [
                    { name: { en: 'Obour District 1', ar: 'العبور حي 1' } },
                ]
            },
            {
                name: { en: 'Shubra El Kheima', ar: 'شبرا الخيمة' }, areas: [
                    { name: { en: 'Shubra Center', ar: 'شبرا المركز' } },
                ]
            },
        ]
    },
    // Monufia Governorate
    {
        name: { en: 'Monufia', ar: 'المنوفية' },
        cities: [
            {
                name: { en: 'Shibin El Kom', ar: 'شبين الكوم' }, areas: [
                    { name: { en: 'Shibin Center', ar: 'شبين المركز' } },
                ]
            },
            {
                name: { en: 'Menouf', ar: 'منوف' }, areas: [
                    { name: { en: 'Menouf City', ar: 'مدينة منوف' } },
                ]
            },
        ]
    },
    // Beheira Governorate
    {
        name: { en: 'Beheira', ar: 'البحيرة' },
        cities: [
            {
                name: { en: 'Damanhour', ar: 'دمنهور' }, areas: [
                    { name: { en: 'Damanhour Center', ar: 'دمنهور المركز' } },
                ]
            },
            {
                name: { en: 'Kafr El Dawar', ar: 'كفر الدوار' }, areas: [
                    { name: { en: 'Kafr El Dawar City', ar: 'مدينة كفر الدوار' } },
                ]
            },
        ]
    },
    // Kafr El Sheikh Governorate
    {
        name: { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
        cities: [
            {
                name: { en: 'Kafr El Sheikh City', ar: 'مدينة كفر الشيخ' }, areas: [
                    { name: { en: 'Kafr Center', ar: 'كفر المركز' } },
                ]
            },
            {
                name: { en: 'Desouk', ar: 'دسوق' }, areas: [
                    { name: { en: 'Desouk City', ar: 'مدينة دسوق' } },
                ]
            },
        ]
    },
    // Ismailia Governorate
    {
        name: { en: 'Ismailia', ar: 'الإسماعيلية' },
        cities: [
            {
                name: { en: 'Ismailia City', ar: 'مدينة الإسماعيلية' }, areas: [
                    { name: { en: 'Ismailia Center', ar: 'الإسماعيلية المركز' } },
                ]
            },
        ]
    },
    // Port Said Governorate
    {
        name: { en: 'Port Said', ar: 'بورسعيد' },
        cities: [
            {
                name: { en: 'Port Said City', ar: 'مدينة بورسعيد' }, areas: [
                    { name: { en: 'Port Said Center', ar: 'بورسعيد المركز' } },
                    { name: { en: 'Arab District', ar: 'حي العرب' } },
                ]
            },
        ]
    },
    // Suez Governorate
    {
        name: { en: 'Suez', ar: 'السويس' },
        cities: [
            {
                name: { en: 'Suez City', ar: 'مدينة السويس' }, areas: [
                    { name: { en: 'Suez Center', ar: 'السويس المركز' } },
                ]
            },
            {
                name: { en: 'Ain Sokhna', ar: 'العين السخنة' }, areas: [
                    { name: { en: 'Ain Sokhna Beach', ar: 'شاطئ العين السخنة' } },
                ]
            },
        ]
    },
    // Damietta Governorate
    {
        name: { en: 'Damietta', ar: 'دمياط' },
        cities: [
            {
                name: { en: 'Damietta City', ar: 'مدينة دمياط' }, areas: [
                    { name: { en: 'Damietta Center', ar: 'دمياط المركز' } },
                ]
            },
            {
                name: { en: 'New Damietta', ar: 'دمياط الجديدة' }, areas: [
                    { name: { en: 'New Damietta Center', ar: 'دمياط الجديدة المركز' } },
                ]
            },
        ]
    },
    // Fayoum Governorate
    {
        name: { en: 'Fayoum', ar: 'الفيوم' },
        cities: [
            {
                name: { en: 'Fayoum City', ar: 'مدينة الفيوم' }, areas: [
                    { name: { en: 'Fayoum Center', ar: 'الفيوم المركز' } },
                ]
            },
        ]
    },
    // Beni Suef Governorate
    {
        name: { en: 'Beni Suef', ar: 'بني سويف' },
        cities: [
            {
                name: { en: 'Beni Suef City', ar: 'مدينة بني سويف' }, areas: [
                    { name: { en: 'Beni Suef Center', ar: 'بني سويف المركز' } },
                ]
            },
        ]
    },
    // Minya Governorate
    {
        name: { en: 'Minya', ar: 'المنيا' },
        cities: [
            {
                name: { en: 'Minya City', ar: 'مدينة المنيا' }, areas: [
                    { name: { en: 'Minya Center', ar: 'المنيا المركز' } },
                ]
            },
            {
                name: { en: 'Mallawi', ar: 'ملوي' }, areas: [
                    { name: { en: 'Mallawi City', ar: 'مدينة ملوي' } },
                ]
            },
        ]
    },
    // Assiut Governorate
    {
        name: { en: 'Assiut', ar: 'أسيوط' },
        cities: [
            {
                name: { en: 'Assiut City', ar: 'مدينة أسيوط' }, areas: [
                    { name: { en: 'Assiut Center', ar: 'أسيوط المركز' } },
                ]
            },
        ]
    },
    // Sohag Governorate
    {
        name: { en: 'Sohag', ar: 'سوهاج' },
        cities: [
            {
                name: { en: 'Sohag City', ar: 'مدينة سوهاج' }, areas: [
                    { name: { en: 'Sohag Center', ar: 'سوهاج المركز' } },
                ]
            },
        ]
    },
    // Qena Governorate
    {
        name: { en: 'Qena', ar: 'قنا' },
        cities: [
            {
                name: { en: 'Qena City', ar: 'مدينة قنا' }, areas: [
                    { name: { en: 'Qena Center', ar: 'قنا المركز' } },
                ]
            },
        ]
    },
    // Luxor Governorate
    {
        name: { en: 'Luxor', ar: 'الأقصر' },
        cities: [
            {
                name: { en: 'Luxor City', ar: 'مدينة الأقصر' }, areas: [
                    { name: { en: 'Luxor Center', ar: 'الأقصر المركز' } },
                    { name: { en: 'Karnak', ar: 'الكرنك' } },
                ]
            },
        ]
    },
    // Aswan Governorate
    {
        name: { en: 'Aswan', ar: 'أسوان' },
        cities: [
            {
                name: { en: 'Aswan City', ar: 'مدينة أسوان' }, areas: [
                    { name: { en: 'Aswan Center', ar: 'أسوان المركز' } },
                ]
            },
        ]
    },
    // Red Sea Governorate
    {
        name: { en: 'Red Sea', ar: 'البحر الأحمر' },
        cities: [
            {
                name: { en: 'Hurghada', ar: 'الغردقة' }, areas: [
                    { name: { en: 'Hurghada Center', ar: 'الغردقة المركز' } },
                    { name: { en: 'El Gouna', ar: 'الجونة' } },
                ]
            },
        ]
    },
    // Matrouh Governorate
    {
        name: { en: 'Matrouh', ar: 'مطروح' },
        cities: [
            {
                name: { en: 'Marsa Matrouh', ar: 'مرسى مطروح' }, areas: [
                    { name: { en: 'Matrouh Center', ar: 'مطروح المركز' } },
                ]
            },
            {
                name: { en: 'El Alamein', ar: 'العلمين' }, areas: [
                    { name: { en: 'New Alamein', ar: 'العلمين الجديدة' } },
                ]
            },
        ]
    },
    // North Sinai Governorate
    {
        name: { en: 'North Sinai', ar: 'شمال سيناء' },
        cities: [
            {
                name: { en: 'Arish', ar: 'العريش' }, areas: [
                    { name: { en: 'Arish Center', ar: 'العريش المركز' } },
                ]
            },
        ]
    },
    // South Sinai Governorate
    {
        name: { en: 'South Sinai', ar: 'جنوب سيناء' },
        cities: [
            {
                name: { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' }, areas: [
                    { name: { en: 'Naama Bay', ar: 'خليج نعمة' } },
                    { name: { en: 'Hadaba', ar: 'الهضبة' } },
                ]
            },
            {
                name: { en: 'Dahab', ar: 'دهب' }, areas: [
                    { name: { en: 'Dahab City', ar: 'مدينة دهب' } },
                ]
            },
        ]
    },
    // New Valley Governorate
    {
        name: { en: 'New Valley', ar: 'الوادي الجديد' },
        cities: [
            {
                name: { en: 'Kharga', ar: 'الخارجة' }, areas: [
                    { name: { en: 'Kharga City', ar: 'مدينة الخارجة' } },
                ]
            },
        ]
    },
];

module.exports = { locationsData };
