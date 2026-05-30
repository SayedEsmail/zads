// Comprehensive Egyptian Locations Data for Seeding
// 27 Governorates -> Cities/Districts -> Neighborhoods/Areas
// Dual-Language Support: English & Arabic

const locationsData = [
    // 1. Cairo Governorate (محافظة القاهرة)
    {
        name: { en: 'Cairo', ar: 'القاهرة' },
        cities: [
            {
                name: { en: 'Nasr City', ar: 'مدينة نصر' },
                areas: [
                    { name: { en: 'First District', ar: 'الحي الأول' } },
                    { name: { en: 'Sixth District', ar: 'الحي السادس' } },
                    { name: { en: 'Seventh District', ar: 'الحي السابع' } },
                    { name: { en: 'Eighth District', ar: 'الحي الثامن' } },
                    { name: { en: 'Tenth District', ar: 'الحي العاشر' } },
                    { name: { en: 'Abbas El Akkad', ar: 'عباس العقاد' } },
                    { name: { en: 'Makram Ebeid', ar: 'مكرم عبيد' } },
                    { name: { en: 'Zahraa Nasr City', ar: 'زهراء مدينة نصر' } },
                    { name: { en: 'Waha District', ar: 'حي الواحة' } }
                ]
            },
            {
                name: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
                areas: [
                    { name: { en: 'Fifth Settlement', ar: 'التجمع الخامس' } },
                    { name: { en: 'First Settlement', ar: 'التجمع الأول' } },
                    { name: { en: 'Third Settlement', ar: 'التجمع الثالث' } },
                    { name: { en: 'El-Rehab City', ar: 'مدينة الرحاب' } },
                    { name: { en: 'Madinaty', ar: 'مدينتي' } },
                    { name: { en: 'Al-Banafsaj', ar: 'البنفسج' } },
                    { name: { en: 'Al-Yasmeen', ar: 'الياسمين' } },
                    { name: { en: 'Al-Lotus', ar: 'اللوتس' } },
                    { name: { en: 'Al-Narges', ar: 'النرجس' } }
                ]
            },
            {
                name: { en: 'Heliopolis', ar: 'مصر الجديدة' },
                areas: [
                    { name: { en: 'Korba', ar: 'الكوربة' } },
                    { name: { en: 'Roxy', ar: 'روكسي' } },
                    { name: { en: 'Sheraton', ar: 'شيراتون' } },
                    { name: { en: 'El Nozha', ar: 'النزهة' } },
                    { name: { en: 'Heliopolis Square', ar: 'ميدان الجامع' } },
                    { name: { en: 'Triumph', ar: 'تريومف' } }
                ]
            },
            {
                name: { en: 'Maadi', ar: 'المعادي' },
                areas: [
                    { name: { en: 'Maadi Sarayat', ar: 'المعادي السرايات' } },
                    { name: { en: 'Degla', ar: 'دجلة' } },
                    { name: { en: 'Zahraa El Maadi', ar: 'زهراء المعادي' } },
                    { name: { en: 'Hadayek El Maadi', ar: 'حدائق المعادي' } },
                    { name: { en: 'New Maadi', ar: 'المعادي الجديدة' } }
                ]
            },
            {
                name: { en: 'Mokattam', ar: 'المقطم' },
                areas: [
                    { name: { en: 'Nafoura Square', ar: 'ميدان النافورة' } },
                    { name: { en: 'Uptown Cairo', ar: 'أبتاون كايرو' } },
                    { name: { en: 'Hadayek El Mokattam', ar: 'حدائق المقطم' } },
                    { name: { en: 'Central Plateau', ar: 'الهضبة الوسطى' } }
                ]
            },
            {
                name: { en: 'Shubra', ar: 'شبرا' },
                areas: [
                    { name: { en: 'Shubra Street', ar: 'شارع شبرا' } },
                    { name: { en: 'Khalafawy', ar: 'الخلفاوي' } },
                    { name: { en: 'Rod El Farag', ar: 'روض الفرج' } },
                    { name: { en: 'Saint Theresa', ar: 'سانت تريزا' } }
                ]
            },
            {
                name: { en: 'Zamalek', ar: 'الزمالك' },
                areas: [
                    { name: { en: 'Zamalek North', ar: 'الزمالك الشمالي' } },
                    { name: { en: 'Zamalek South', ar: 'الزمالك الجنوبي' } },
                    { name: { en: '26th of July St.', ar: 'شارع ٢٦ يوليو' } }
                ]
            },
            {
                name: { en: 'Downtown', ar: 'وسط البلد' },
                areas: [
                    { name: { en: 'Tahrir Square', ar: 'ميدان التحرير' } },
                    { name: { en: 'Talaat Harb', ar: 'طلعت حرب' } },
                    { name: { en: 'Ramses Square', ar: 'ميدان رمسيس' } },
                    { name: { en: 'Bab El Louk', ar: 'باب اللوق' } }
                ]
            },
            {
                name: { en: 'Shorouk City', ar: 'مدينة الشروق' },
                areas: [
                    { name: { en: 'First District', ar: 'الحي الأول' } },
                    { name: { en: 'Second District', ar: 'الحي الثاني' } },
                    { name: { en: 'Seventh District', ar: 'الحي السابع' } },
                    { name: { en: 'Al-Nadi District', ar: 'حي النادي' } }
                ]
            },
            {
                name: { en: 'Obour City', ar: 'مدينة العبور' },
                areas: [
                    { name: { en: 'First District', ar: 'الحي الأول' } },
                    { name: { en: 'Second District', ar: 'الحي الثاني' } },
                    { name: { en: 'Fifth District', ar: 'الحي الخامس' } },
                    { name: { en: 'Golf City', ar: 'جولف سيتي' } }
                ]
            },
            {
                name: { en: 'Badr City', ar: 'مدينة بدر' },
                areas: [
                    { name: { en: 'Jasmine District', ar: 'حي الياسمين' } },
                    { name: { en: 'Ashgar District', ar: 'حي الأشجار' } }
                ]
            },
            {
                name: { en: 'El-Marg', ar: 'المرج' },
                areas: [
                    { name: { en: 'El-Marg El-Gedeeda', ar: 'المرج الجديدة' } },
                    { name: { en: 'El-Marg El-Qadeema', ar: 'المرج القديمة' } }
                ]
            },
            {
                name: { en: 'Ain Shams', ar: 'عين شمس' },
                areas: [
                    { name: { en: 'Ain Shams East', ar: 'عين شمس الشرقية' } },
                    { name: { en: 'Ain Shams West', ar: 'عين شمس الغربية' } }
                ]
            },
            {
                name: { en: 'Hadayek El-Kobba', ar: 'حدائق القبة' },
                areas: [
                    { name: { en: 'Kobba Palace Area', ar: 'منطقة سراي القبة' } },
                    { name: { en: 'El-Waili', ar: 'الوايلي' } }
                ]
            },
            {
                name: { en: 'Al-Zaytoun', ar: 'الزيتون' },
                areas: [
                    { name: { en: 'Helmeyat El-Zaytoun', ar: 'حلمية الزيتون' } },
                    { name: { en: 'Hadaeq El-Zaytoun', ar: 'حدائق الزيتون' } }
                ]
            },
            {
                name: { en: 'Helwan', ar: 'حلوان' },
                areas: [
                    { name: { en: 'Helwan City Center', ar: 'وسط مدينة حلوان' } },
                    { name: { en: 'Hadayek Helwan', ar: 'حدائق حلوان' } },
                    { name: { en: 'El-Maasara', ar: 'المعصرة' } }
                ]
            },
            {
                name: { en: 'New Administrative Capital', ar: 'العاصمة الإدارية الجديدة' },
                areas: [
                    { name: { en: 'Residential District R3', ar: 'الحي السكني R3' } },
                    { name: { en: 'Residential District R5', ar: 'الحي السكني R5' } },
                    { name: { en: 'Financial District', ar: 'الحي المالي' } }
                ]
            }
        ]
    },

    // 2. Giza Governorate (محافظة الجيزة)
    {
        name: { en: 'Giza', ar: 'الجيزة' },
        cities: [
            {
                name: { en: '6th of October', ar: '6 أكتوبر' },
                areas: [
                    { name: { en: '1st District', ar: 'الحي الأول' } },
                    { name: { en: '2nd District', ar: 'الحي الثاني' } },
                    { name: { en: '3rd District', ar: 'الحي الثالث' } },
                    { name: { en: '4th District', ar: 'الحي الرابع' } },
                    { name: { en: '5th District', ar: 'الحي الخامس' } },
                    { name: { en: '7th District', ar: 'الحي السابع' } },
                    { name: { en: '8th District', ar: 'الحي الثامن' } },
                    { name: { en: 'Ashgar District', ar: 'حي الأشجار' } },
                    { name: { en: 'West Somid', ar: 'غرب سوميد' } }
                ]
            },
            {
                name: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
                areas: [
                    { name: { en: '1st District', ar: 'الحي الأول' } },
                    { name: { en: '2nd District', ar: 'الحي الثاني' } },
                    { name: { en: '8th District', ar: 'الحي الثامن' } },
                    { name: { en: '11th District', ar: 'الحي ١١' } },
                    { name: { en: '14th District', ar: 'الحي ١٤' } },
                    { name: { en: 'Beverly Hills', ar: 'بيفرلي هيلز' } },
                    { name: { en: 'Zayed Dunes', ar: 'زايد ديونز' } }
                ]
            },
            {
                name: { en: 'Dokki', ar: 'الدقي' },
                areas: [
                    { name: { en: 'Dokki Square', ar: 'ميدان الدقي' } },
                    { name: { en: 'Mesaha Square', ar: 'ميدان المساحة' } },
                    { name: { en: 'Iran Street', ar: 'شارع إيران' } },
                    { name: { en: 'Tahrir Street', ar: 'شارع التحرير' } }
                ]
            },
            {
                name: { en: 'Mohandessin', ar: 'المهندسين' },
                areas: [
                    { name: { en: 'Lebanon Square', ar: 'ميدان لبنان' } },
                    { name: { en: 'Gameat El Dowal St.', ar: 'شارع جامعة الدول' } },
                    { name: { en: 'Sphinx Square', ar: 'ميدان سفنكس' } },
                    { name: { en: 'Shehab Street', ar: 'شارع شهاب' } },
                    { name: { en: 'Syria Street', ar: 'شارع سوريا' } }
                ]
            },
            {
                name: { en: 'El Haram', ar: 'الهرم' },
                areas: [
                    { name: { en: 'Haram Street', ar: 'شارع الهرم' } },
                    { name: { en: 'Giza Square', ar: 'ميدان الجيزة' } },
                    { name: { en: 'Maryoutia', ar: 'المريوطية' } },
                    { name: { en: 'Mansouria', ar: 'المنصورية' } },
                    { name: { en: 'El-Arish', ar: 'العريش' } }
                ]
            },
            {
                name: { en: 'Faisal', ar: 'فيصل' },
                areas: [
                    { name: { en: 'Faisal Street', ar: 'شارع فيصل' } },
                    { name: { en: 'El-Ashreen', ar: 'العشرين' } },
                    { name: { en: 'El-Talbia', ar: 'الطالبية' } },
                    { name: { en: 'Hassan Mohamed', ar: 'حسن محمد' } }
                ]
            },
            {
                name: { en: 'Agouza', ar: 'العجوزة' },
                areas: [
                    { name: { en: 'Nile Front', ar: 'كورنيش النيل العجوزة' } },
                    { name: { en: 'Kit Kat', ar: 'الكيت كات' } },
                    { name: { en: 'El-Balon Area', ar: 'منطقة البالون' } }
                ]
            },
            {
                name: { en: 'Imbaba', ar: 'إمبابة' },
                areas: [
                    { name: { en: 'Imbaba Center', ar: 'وسط إمبابة' } },
                    { name: { en: 'El-Monira', ar: 'المنيرة' } }
                ]
            },
            {
                name: { en: 'Boulaq Al-Dakrour', ar: 'بولاق الدكرور' },
                areas: [
                    { name: { en: 'Boulaq Center', ar: 'وسط بولاق' } },
                    { name: { en: 'El-Horeya Street', ar: 'شارع الحرية' } }
                ]
            },
            {
                name: { en: 'Al-Badrasheen', ar: 'البدرشين' },
                areas: [
                    { name: { en: 'Al-Badrasheen City', ar: 'مدينة البدرشين' } },
                    { name: { en: 'Dahshur', ar: 'دهشور' } }
                ]
            },
            {
                name: { en: 'Al-Ayat', ar: 'العياط' },
                areas: [
                    { name: { en: 'Al-Ayat City', ar: 'مدينة العياط' } }
                ]
            },
            {
                name: { en: 'Kerdasa', ar: 'كرداسة' },
                areas: [
                    { name: { en: 'Kerdasa City', ar: 'مدينة كرداسة' } },
                    { name: { en: 'Abu Rawash', ar: 'أبو رواش' } }
                ]
            }
        ]
    },

    // 3. Alexandria Governorate (محافظة الإسكندرية)
    {
        name: { en: 'Alexandria', ar: 'الإسكندرية' },
        cities: [
            {
                name: { en: 'Smouha', ar: 'سموحة' },
                areas: [
                    { name: { en: 'Victor Emmanuel Square', ar: 'ميدان فيكتور عمانويل' } },
                    { name: { en: 'Ibrahim Sherif St.', ar: 'شارع إبراهيم شريف' } },
                    { name: { en: 'Smouha Square', ar: 'ميدان سموحة' } },
                    { name: { en: 'Green Plaza Area', ar: 'منطقة جرين بلازا' } }
                ]
            },
            {
                name: { en: 'Sidi Gaber', ar: 'سيدي جابر' },
                areas: [
                    { name: { en: 'Sidi Gaber Station Area', ar: 'منطقة محطة سيدي جابر' } },
                    { name: { en: 'Cleopatra', ar: 'كليوباترا' } },
                    { name: { en: 'Sporting', ar: 'سبورتنج' } }
                ]
            },
            {
                name: { en: 'El-Montaza', ar: 'المنتزه' },
                areas: [
                    { name: { en: 'Mandara', ar: 'المندرة' } },
                    { name: { en: 'Montaza Palace Area', ar: 'منطقة حدائق المنتزه' } },
                    { name: { en: 'Asafra', ar: 'العصافرة' } },
                    { name: { en: 'Sidi Bishr', ar: 'سيدي بشر' } }
                ]
            },
            {
                name: { en: 'Miami', ar: 'ميامي' },
                areas: [
                    { name: { en: 'Miami Beach Area', ar: 'منطقة شاطئ ميامي' } },
                    { name: { en: 'Khaled Ibn El Walid St.', ar: 'شارع خالد بن الوليد' } },
                    { name: { en: '45th Street', ar: 'شارع ٤٥' } }
                ]
            },
            {
                name: { en: 'Raml Station', ar: 'محطة الرمل' },
                areas: [
                    { name: { en: 'Saad Zaghloul Square', ar: 'ميدان سعد زغلول' } },
                    { name: { en: 'El-Mansheya', ar: 'المنشية' } },
                    { name: { en: 'Downtown Alex', ar: 'وسط البلد الإسكندرية' } }
                ]
            },
            {
                name: { en: 'El-Agamy', ar: 'العجمي' },
                areas: [
                    { name: { en: 'Bianchi', ar: 'بيانكي' } },
                    { name: { en: 'Abu Youssef', ar: 'أبو يوسف' } },
                    { name: { en: 'Hanoville', ar: 'هانوفيل' } },
                    { name: { en: 'Bitash', ar: 'البيطاش' } }
                ]
            },
            {
                name: { en: 'Louran', ar: 'لوران' },
                areas: [
                    { name: { en: 'Louran District', ar: 'حي لوران' } },
                    { name: { en: 'San Stefano', ar: 'سان ستيفانو' } },
                    { name: { en: 'Zizinia', ar: 'زيزينيا' } }
                ]
            },
            {
                name: { en: 'Stanley', ar: 'ستانلي' },
                areas: [
                    { name: { en: 'Stanley Bridge Area', ar: 'منطقة كوبري ستانلي' } },
                    { name: { en: 'Roushdy', ar: 'رشدي' } },
                    { name: { en: 'Kafr Abdo', ar: 'كفر عبده' } }
                ]
            },
            {
                name: { en: 'Borg El-Arab', ar: 'برج العرب' },
                areas: [
                    { name: { en: 'New Borg El-Arab', ar: 'برج العرب الجديدة' } },
                    { name: { en: 'Borg El-Arab Village', ar: 'قرية برج العرب' } }
                ]
            },
            {
                name: { en: 'Al-Amreya', ar: 'العامرية' },
                areas: [
                    { name: { en: 'Al-Amreya First', ar: 'العامرية أول' } },
                    { name: { en: 'Al-Amreya Second', ar: 'العامرية ثان' } }
                ]
            }
        ]
    },

    // 4. Dakahlia Governorate (محافظة الدقهلية)
    {
        name: { en: 'Dakahlia', ar: 'الدقهلية' },
        cities: [
            {
                name: { en: 'Mansoura', ar: 'المنصورة' },
                areas: [
                    { name: { en: 'Gehan Street', ar: 'شارع جيهان' } },
                    { name: { en: 'Toriel District', ar: 'حي طوريل' } },
                    { name: { en: 'Al-Galaa', ar: 'الجلاء' } },
                    { name: { en: 'Suez Canal Street', ar: 'شارع قناة السويس' } },
                    { name: { en: 'Mansoura University Area', ar: 'منطقة جامعة المنصورة' } },
                    { name: { en: 'Mansoura City Center', ar: 'وسط البلد المنصورة' } }
                ]
            },
            {
                name: { en: 'Talkha', ar: 'طلخا' },
                areas: [
                    { name: { en: 'Talkha City Center', ar: 'وسط مدينة طلخا' } },
                    { name: { en: 'Talkha Subdivisions', ar: 'تقسيمات طلخا السكنية' } }
                ]
            },
            {
                name: { en: 'Mit Ghamr', ar: 'ميت غمر' },
                areas: [
                    { name: { en: 'Mit Ghamr City Center', ar: 'وسط مدينة ميت غمر' } },
                    { name: { en: 'Mit Ghamr Villages', ar: 'قرى ميت غمر' } }
                ]
            },
            {
                name: { en: 'Senbellawein', ar: 'السنبلاوين' },
                areas: [
                    { name: { en: 'Senbellawein City Center', ar: 'وسط السنبلاوين' } }
                ]
            },
            {
                name: { en: 'Sherbin', ar: 'شربين' },
                areas: [
                    { name: { en: 'Sherbin City Center', ar: 'وسط شربين' } }
                ]
            },
            {
                name: { en: 'Dikirnis', ar: 'دكرنس' },
                areas: [
                    { name: { en: 'Dikirnis City Center', ar: 'وسط دكرنس' } }
                ]
            }
        ]
    },

    // 5. Sharqia Governorate (محافظة الشرقية)
    {
        name: { en: 'Sharqia', ar: 'الشرقية' },
        cities: [
            {
                name: { en: 'Zagazig', ar: 'الزقازيق' },
                areas: [
                    { name: { en: 'Zagazig City Center', ar: 'وسط البلد الزقازيق' } },
                    { name: { en: 'El-Qawmiah Area', ar: 'منطقة القومية' } },
                    { name: { en: 'Station Square Area', ar: 'منطقة ميدان المحطة' } },
                    { name: { en: 'El-Zohour District', ar: 'حي الزهور' } }
                ]
            },
            {
                name: { en: '10th of Ramadan', ar: 'العاشر من رمضان' },
                areas: [
                    { name: { en: 'First District', ar: 'الحي الأول' } },
                    { name: { en: 'Second District', ar: 'الحي الثاني' } },
                    { name: { en: 'Third District', ar: 'الحي الثالث' } },
                    { name: { en: 'Fifth District', ar: 'الحي الخامس' } }
                ]
            },
            {
                name: { en: 'Belbeis', ar: 'بلبيس' },
                areas: [
                    { name: { en: 'Belbeis City Center', ar: 'وسط بلبيس' } }
                ]
            },
            {
                name: { en: 'Minya El-Qamh', ar: 'منيا القمح' },
                areas: [
                    { name: { en: 'Minya El-Qamh Center', ar: 'وسط منيا القمح' } }
                ]
            },
            {
                name: { en: 'Faqous', ar: 'فاقوس' },
                areas: [
                    { name: { en: 'Faqous City Center', ar: 'وسط فاقوس' } }
                ]
            }
        ]
    },

    // 6. Gharbia Governorate (محافظة الغربية)
    {
        name: { en: 'Gharbia', ar: 'الغربية' },
        cities: [
            {
                name: { en: 'Tanta', ar: 'طنطا' },
                areas: [
                    { name: { en: 'Tanta City Center', ar: 'وسط البلد طنطا' } },
                    { name: { en: 'El-Galaa Street', ar: 'شارع الجلاء طنطا' } },
                    { name: { en: 'El-Nahas Street', ar: 'شارع النحاس' } },
                    { name: { en: 'El-Fateh Area', ar: 'منطقة الفاتح' } }
                ]
            },
            {
                name: { en: 'Mahalla El Kubra', ar: 'المحلة الكبرى' },
                areas: [
                    { name: { en: 'Mahalla City Center', ar: 'وسط البلد المحلة' } },
                    { name: { en: 'El-Saba Banat', ar: 'السبع بنات' } },
                    { name: { en: 'Abu Shahin District', ar: 'حي أبو شاهين' } }
                ]
            },
            {
                name: { en: 'Kafr El Zayat', ar: 'كفر الزيات' },
                areas: [
                    { name: { en: 'Kafr El Zayat Center', ar: 'وسط كفر الزيات' } }
                ]
            },
            {
                name: { en: 'Zefta', ar: 'زفتى' },
                areas: [
                    { name: { en: 'Zefta City Center', ar: 'وسط زفتى' } }
                ]
            }
        ]
    },

    // 7. Qalyubia Governorate (محافظة القليوبية)
    {
        name: { en: 'Qalyubia', ar: 'القليوبية' },
        cities: [
            {
                name: { en: 'Banha', ar: 'بنها' },
                areas: [
                    { name: { en: 'Banha City Center', ar: 'وسط البلد بنها' } },
                    { name: { en: 'El-Fellal District', ar: 'حي الفلل' } },
                    { name: { en: 'Kafr El-Gazar', ar: 'كفر الجزار' } }
                ]
            },
            {
                name: { en: 'Shubra El Kheima', ar: 'شبرا الخيمة' },
                areas: [
                    { name: { en: 'Shubra El Kheima First', ar: 'شبرا أول' } },
                    { name: { en: 'Shubra El Kheima Second', ar: 'شبرا ثان' } }
                ]
            },
            {
                name: { en: 'Khanka', ar: 'الخانكة' },
                areas: [
                    { name: { en: 'Khanka City Center', ar: 'وسط الخانكة' } }
                ]
            },
            {
                name: { en: 'Qalyub', ar: 'قليوب' },
                areas: [
                    { name: { en: 'Qalyub City Center', ar: 'وسط قليوب' } }
                ]
            },
            {
                name: { en: 'Shebin El Qanater', ar: 'شبين القناطر' },
                areas: [
                    { name: { en: 'Shebin Center', ar: 'وسط شبين القناطر' } }
                ]
            }
        ]
    },

    // 8. Monufia Governorate (محافظة المنوفية)
    {
        name: { en: 'Monufia', ar: 'المنوفية' },
        cities: [
            {
                name: { en: 'Shibin El Kom', ar: 'شبين الكوم' },
                areas: [
                    { name: { en: 'Shibin City Center', ar: 'وسط البلد شبين الكوم' } },
                    { name: { en: 'El-Galaa Area', ar: 'منطقة الجلاء شبين' } },
                    { name: { en: 'El-Ber El-Sharki', ar: 'البر الشرقي' } }
                ]
            },
            {
                name: { en: 'Menouf', ar: 'منوف' },
                areas: [
                    { name: { en: 'Menouf City Center', ar: 'وسط منوف' } }
                ]
            },
            {
                name: { en: 'Sadat City', ar: 'مدينة السادات' },
                areas: [
                    { name: { en: 'Sadat Residential Areas', ar: 'المناطق السكنية بالسادات' } }
                ]
            },
            {
                name: { en: 'Ashmoun', ar: 'أشمون' },
                areas: [
                    { name: { en: 'Ashmoun City Center', ar: 'وسط أشمون' } }
                ]
            },
            {
                name: { en: 'Quesna', ar: 'قويسنا' },
                areas: [
                    { name: { en: 'Quesna City Center', ar: 'وسط قويسنا' } }
                ]
            }
        ]
    },

    // 9. Beheira Governorate (محافظة البحيرة)
    {
        name: { en: 'Beheira', ar: 'البحيرة' },
        cities: [
            {
                name: { en: 'Damanhour', ar: 'دمنهور' },
                areas: [
                    { name: { en: 'Damanhour City Center', ar: 'وسط البلد دمنهور' } },
                    { name: { en: 'Shobra District', ar: 'حي شبرا دمنهور' } },
                    { name: { en: 'Sa3a Square Area', ar: 'منطقة ميدان الساعة' } }
                ]
            },
            {
                name: { en: 'Kafr El Dawar', ar: 'كفر الدوار' },
                areas: [
                    { name: { en: 'Kafr El Dawar Center', ar: 'وسط كفر الدوار' } }
                ]
            },
            {
                name: { en: 'Rosetta', ar: 'رشيد' },
                areas: [
                    { name: { en: 'Rosetta City Center', ar: 'وسط رشيد' } }
                ]
            },
            {
                name: { en: 'Edko', ar: 'إدكو' },
                areas: [
                    { name: { en: 'Edko City Center', ar: 'وسط إدكو' } }
                ]
            },
            {
                name: { en: 'Kom Hamada', ar: 'كوم حمادة' },
                areas: [
                    { name: { en: 'Kom Hamada Center', ar: 'وسط كوم حمادة' } }
                ]
            }
        ]
    },

    // 10. Kafr El Sheikh Governorate (محافظة كفر الشيخ)
    {
        name: { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
        cities: [
            {
                name: { en: 'Kafr El Sheikh City', ar: 'مدينة كفر الشيخ' },
                areas: [
                    { name: { en: 'Kafr El Sheikh Center', ar: 'وسط المدينة كفر الشيخ' } },
                    { name: { en: 'El-Mu3alemin District', ar: 'حي المعلمين' } },
                    { name: { en: 'El-Zohour District', ar: 'حي الزهور كفر الشيخ' } }
                ]
            },
            {
                name: { en: 'Desouk', ar: 'دسوق' },
                areas: [
                    { name: { en: 'Desouk City Center', ar: 'وسط دسوق' } }
                ]
            },
            {
                name: { en: 'Metoubes', ar: 'مطوبس' },
                areas: [
                    { name: { en: 'Metoubes City Center', ar: 'وسط مطوبس' } }
                ]
            },
            {
                name: { en: 'Baltim', ar: 'بلطيم' },
                areas: [
                    { name: { en: 'Baltim Resort Area', ar: 'منطقة مصيف بلطيم' } }
                ]
            }
        ]
    },

    // 11. Ismailia Governorate (محافظة الإسماعيلية)
    {
        name: { en: 'Ismailia', ar: 'الإسماعيلية' },
        cities: [
            {
                name: { en: 'Ismailia City', ar: 'مدينة الإسماعيلية' },
                areas: [
                    { name: { en: 'Ismailia Center', ar: 'وسط الإسماعيلية' } },
                    { name: { en: 'Sheikh Zayed District', ar: 'حي الشيخ زايد بالإسماعيلية' } },
                    { name: { en: 'El-Salam District', ar: 'حي السلام' } }
                ]
            },
            {
                name: { en: 'Fayed', ar: 'فايد' },
                areas: [
                    { name: { en: 'Fayed Resort Area', ar: 'منطقة مصايف فايد' } }
                ]
            },
            {
                name: { en: 'El Qantara', ar: 'القنطرة' },
                areas: [
                    { name: { en: 'El Qantara East', ar: 'القنطرة شرق' } },
                    { name: { en: 'El Qantara West', ar: 'القنطرة غرب' } }
                ]
            }
        ]
    },

    // 12. Port Said Governorate (محافظة بورسعيد)
    {
        name: { en: 'Port Said', ar: 'بورسعيد' },
        cities: [
            {
                name: { en: 'Port Said City', ar: 'مدينة بورسعيد' },
                areas: [
                    { name: { en: 'El-Arab District', ar: 'حي العرب' } },
                    { name: { en: 'El-Sharq District', ar: 'حي الشرق' } },
                    { name: { en: 'El-Manakh District', ar: 'حي المناخ' } },
                    { name: { en: 'Al-Zohour District', ar: 'حي الزهور بورسعيد' } }
                ]
            },
            {
                name: { en: 'Port Fouad', ar: 'بورفؤاد' },
                areas: [
                    { name: { en: 'Port Fouad Center', ar: 'وسط بورفؤاد' } }
                ]
            }
        ]
    },

    // 13. Suez Governorate (محافظة السويس)
    {
        name: { en: 'Suez', ar: 'السويس' },
        cities: [
            {
                name: { en: 'Suez City', ar: 'مدينة السويس' },
                areas: [
                    { name: { en: 'El-Arbaeen District', ar: 'حي الأربعين' } },
                    { name: { en: 'Suez City Center', ar: 'وسط البلد السويس' } },
                    { name: { en: 'Faisal District', ar: 'حي فيصل السويس' } },
                    { name: { en: 'Attaka District', ar: 'حي عتاقة' } }
                ]
            },
            {
                name: { en: 'Ain Sokhna', ar: 'العين السخنة' },
                areas: [
                    { name: { en: 'Sokhna Resorts Area', ar: 'منطقة منتجعات السخنة' } },
                    { name: { en: 'Porto Sokhna Area', ar: 'منطقة بورتو سخنة' } }
                ]
            }
        ]
    },

    // 14. Damietta Governorate (محافظة دمياط)
    {
        name: { en: 'Damietta', ar: 'دمياط' },
        cities: [
            {
                name: { en: 'Damietta City', ar: 'مدينة دمياط' },
                areas: [
                    { name: { en: 'Damietta City Center', ar: 'وسط البلد دمياط' } },
                    { name: { en: 'Al-Sha3ra Area', ar: 'منطقة الشعراء' } }
                ]
            },
            {
                name: { en: 'New Damietta', ar: 'دمياط الجديدة' },
                areas: [
                    { name: { en: 'New Damietta Center', ar: 'وسط دمياط الجديدة' } },
                    { name: { en: 'University District', ar: 'حي الجامعة دمياط' } }
                ]
            },
            {
                name: { en: 'Ras El Bar', ar: 'رأس البر' },
                areas: [
                    { name: { en: 'Ras El Bar City Center', ar: 'وسط رأس البر' } }
                ]
            }
        ]
    },

    // 15. Fayoum Governorate (محافظة الفيوم)
    {
        name: { en: 'Fayoum', ar: 'الفيوم' },
        cities: [
            {
                name: { en: 'Fayoum City', ar: 'مدينة الفيوم' },
                areas: [
                    { name: { en: 'Fayoum City Center', ar: 'وسط البلد الفيوم' } },
                    { name: { en: 'El-Muhammadiyah District', ar: 'حي المحمدية' } },
                    { name: { en: 'El-Kimah Area', ar: 'منطقة الكيما' } }
                ]
            },
            {
                name: { en: 'Sinnuris', ar: 'سنورس' },
                areas: [
                    { name: { en: 'Sinnuris City Center', ar: 'وسط سنورس' } }
                ]
            },
            {
                name: { en: 'Ibshaway', ar: 'إبشواي' },
                areas: [
                    { name: { en: 'Ibshaway City Center', ar: 'وسط إبشواي' } }
                ]
            }
        ]
    },

    // 16. Beni Suef Governorate (محافظة بني سويف)
    {
        name: { en: 'Beni Suef', ar: 'بني سويف' },
        cities: [
            {
                name: { en: 'Beni Suef City', ar: 'مدينة بني سويف' },
                areas: [
                    { name: { en: 'Beni Suef Center', ar: 'وسط البلد بني سويف' } },
                    { name: { en: 'El-Sadat District', ar: 'حي السادات' } },
                    { name: { en: 'El-Zohour District', ar: 'حي الزهور بني سويف' } }
                ]
            },
            {
                name: { en: 'Naser', ar: 'ناصر' },
                areas: [
                    { name: { en: 'Naser City Center', ar: 'وسط مدينة ناصر' } }
                ]
            },
            {
                name: { en: 'Biba', ar: 'ببا' },
                areas: [
                    { name: { en: 'Biba City Center', ar: 'وسط ببا' } }
                ]
            }
        ]
    },

    // 17. Minya Governorate (محافظة المنيا)
    {
        name: { en: 'Minya', ar: 'المنيا' },
        cities: [
            {
                name: { en: 'Minya City', ar: 'مدينة المنيا' },
                areas: [
                    { name: { en: 'Minya City Center', ar: 'وسط البلد المنيا' } },
                    { name: { en: 'Shalaby Area', ar: 'منطقة شلبي' } },
                    { name: { en: 'Adnan El-Maliki St.', ar: 'شارع عدنان المالكي' } }
                ]
            },
            {
                name: { en: 'New Minya', ar: 'المنيا الجديدة' },
                areas: [
                    { name: { en: 'New Minya Districts', ar: 'أحياء المنيا الجديدة' } }
                ]
            },
            {
                name: { en: 'Mallawi', ar: 'ملوي' },
                areas: [
                    { name: { en: 'Mallawi City Center', ar: 'وسط ملوي' } }
                ]
            },
            {
                name: { en: 'Bani Mazar', ar: 'بني مزار' },
                areas: [
                    { name: { en: 'Bani Mazar Center', ar: 'وسط بني مزار' } }
                ]
            },
            {
                name: { en: 'Samalut', ar: 'سمالوط' },
                areas: [
                    { name: { en: 'Samalut Center', ar: 'وسط سمالوط' } }
                ]
            }
        ]
    },

    // 18. Assiut Governorate (محافظة أسيوط)
    {
        name: { en: 'Assiut', ar: 'أسيوط' },
        cities: [
            {
                name: { en: 'Assiut City', ar: 'مدينة أسيوط' },
                areas: [
                    { name: { en: 'Assiut City Center', ar: 'وسط البلد أسيوط' } },
                    { name: { en: 'El-Hilaly Street', ar: 'شارع الهلالي' } },
                    { name: { en: 'El-Gomhouria Street', ar: 'شارع الجمهورية أسيوط' } }
                ]
            },
            {
                name: { en: 'New Assiut', ar: 'أسيوط الجديدة' },
                areas: [
                    { name: { en: 'New Assiut Districts', ar: 'أحياء أسيوط الجديدة' } }
                ]
            },
            {
                name: { en: 'Dairut', ar: 'ديروط' },
                areas: [
                    { name: { en: 'Dairut City Center', ar: 'وسط ديروط' } }
                ]
            },
            {
                name: { en: 'Abnoub', ar: 'أبنوب' },
                areas: [
                    { name: { en: 'Abnoub City Center', ar: 'وسط أبنوب' } }
                ]
            }
        ]
    },

    // 19. Sohag Governorate (محافظة سوهاج)
    {
        name: { en: 'Sohag', ar: 'سوهاج' },
        cities: [
            {
                name: { en: 'Sohag City', ar: 'مدينة سوهاج' },
                areas: [
                    { name: { en: 'Sohag City Center', ar: 'وسط البلد سوهاج' } },
                    { name: { en: '15th of East Street', ar: 'شارع ١٥ الشرقية' } },
                    { name: { en: 'El-Zahraa District', ar: 'حي الزهراء سوهاج' } }
                ]
            },
            {
                name: { en: 'New Sohag', ar: 'سوهاج الجديدة' },
                areas: [
                    { name: { en: 'New Sohag Districts', ar: 'أحياء سوهاج الجديدة' } }
                ]
            },
            {
                name: { en: 'Tahta', ar: 'طهطا' },
                areas: [
                    { name: { en: 'Tahta City Center', ar: 'وسط طهطا' } }
                ]
            },
            {
                name: { en: 'Akhmim', ar: 'أخميم' },
                areas: [
                    { name: { en: 'Akhmim City Center', ar: 'وسط أخميم' } }
                ]
            }
        ]
    },

    // 20. Qena Governorate (محافظة قنا)
    {
        name: { en: 'Qena', ar: 'قنا' },
        cities: [
            {
                name: { en: 'Qena City', ar: 'مدينة قنا' },
                areas: [
                    { name: { en: 'Qena City Center', ar: 'وسط البلد قنا' } },
                    { name: { en: 'El-Dahsa Area', ar: 'منطقة الدهسة' } }
                ]
            },
            {
                name: { en: 'Naga Hammadi', ar: 'نجع حمادي' },
                areas: [
                    { name: { en: 'Naga Hammadi Center', ar: 'وسط نجع حمادي' } }
                ]
            },
            {
                name: { en: 'Qus', ar: 'قوص' },
                areas: [
                    { name: { en: 'Qus City Center', ar: 'وسط قوص' } }
                ]
            }
        ]
    },

    // 21. Luxor Governorate (محافظة الأقصر)
    {
        name: { en: 'Luxor', ar: 'الأقصر' },
        cities: [
            {
                name: { en: 'Luxor City', ar: 'مدينة الأقصر' },
                areas: [
                    { name: { en: 'East Bank Area', ar: 'منطقة البر الشرقي' } },
                    { name: { en: 'West Bank Area', ar: 'منطقة البر الغربي الأقصر' } },
                    { name: { en: 'Karnak', ar: 'الكرنك' } },
                    { name: { en: 'El-Awameya', ar: 'العوامية' } }
                ]
            },
            {
                name: { en: 'Esna', ar: 'إسنا' },
                areas: [
                    { name: { en: 'Esna City Center', ar: 'وسط إسنا' } }
                ]
            }
        ]
    },

    // 22. Aswan Governorate (محافظة أسوان)
    {
        name: { en: 'Aswan', ar: 'أسوان' },
        cities: [
            {
                name: { en: 'Aswan City', ar: 'مدينة أسوان' },
                areas: [
                    { name: { en: 'Aswan City Center', ar: 'وسط البلد أسوان' } },
                    { name: { en: 'Nile Corniche Area', ar: 'منطقة كورنيش النيل أسوان' } },
                    { name: { en: 'El-Sadat District', ar: 'حي السادات أسوان' } },
                    { name: { en: 'West Aswan', ar: 'غرب أسوان' } }
                ]
            },
            {
                name: { en: 'Kom Ombo', ar: 'كوم أمبو' },
                areas: [
                    { name: { en: 'Kom Ombo Center', ar: 'وسط كوم أمبو' } }
                ]
            },
            {
                name: { en: 'Edfu', ar: 'إدفو' },
                areas: [
                    { name: { en: 'Edfu City Center', ar: 'وسط إدفو' } }
                ]
            }
        ]
    },

    // 23. Red Sea Governorate (محافظة البحر الأحمر)
    {
        name: { en: 'Red Sea', ar: 'البحر الأحمر' },
        cities: [
            {
                name: { en: 'Hurghada', ar: 'الغردقة' },
                areas: [
                    { name: { en: 'El Dahar', ar: 'الدهار' } },
                    { name: { en: 'El Sakala', ar: 'السقالة' } },
                    { name: { en: 'El Kawther', ar: 'الكوثر' } },
                    { name: { en: 'Touristic Promenade', ar: 'الممشى السياحي' } },
                    { name: { en: 'El Gouna Area', ar: 'منطقة الجونة' } },
                    { name: { en: 'Sahl Hasheesh Area', ar: 'منطقة سهل حشيش' } }
                ]
            },
            {
                name: { en: 'Safaga', ar: 'سفاجا' },
                areas: [
                    { name: { en: 'Safaga City Center', ar: 'وسط سفاجا' } }
                ]
            },
            {
                name: { en: 'Marsa Alam', ar: 'مرسى علم' },
                areas: [
                    { name: { en: 'Marsa Alam Center', ar: 'وسط مرسى علم' } }
                ]
            }
        ]
    },

    // 24. Matrouh Governorate (محافظة مطروح)
    {
        name: { en: 'Matrouh', ar: 'مطروح' },
        cities: [
            {
                name: { en: 'Marsa Matrouh', ar: 'مرسى مطروح' },
                areas: [
                    { name: { en: 'Matrouh City Center', ar: 'وسط مدينة مطروح' } },
                    { name: { en: 'El-Gharam Beach Area', ar: 'منطقة شاطئ الغرام' } },
                    { name: { en: 'Ageeba Area', ar: 'منطقة عجيبة' } }
                ]
            },
            {
                name: { en: 'El Alamein', ar: 'العلمين' },
                areas: [
                    { name: { en: 'New Alamein City', ar: 'مدينة العلمين الجديدة' } },
                    { name: { en: 'Marina Area', ar: 'منطقة مارينا' } }
                ]
            },
            {
                name: { en: 'Siwa Oasis', ar: 'واحة سيوة' },
                areas: [
                    { name: { en: 'Siwa City Center', ar: 'وسط سيوة' } }
                ]
            }
        ]
    },

    // 25. North Sinai Governorate (محافظة شمال سيناء)
    {
        name: { en: 'North Sinai', ar: 'شمال سيناء' },
        cities: [
            {
                name: { en: 'Arish', ar: 'العريش' },
                areas: [
                    { name: { en: 'Arish City Center', ar: 'وسط العريش' } },
                    { name: { en: 'Masaeed District', ar: 'حي المساعيد' } },
                    { name: { en: 'Fawayda Area', ar: 'منطقة الفوايدة' } }
                ]
            },
            {
                name: { en: 'Bir El Abd', ar: 'بئر العبد' },
                areas: [
                    { name: { en: 'Bir El Abd Center', ar: 'وسط بئر العبد' } }
                ]
            }
        ]
    },

    // 26. South Sinai Governorate (محافظة جنوب سيناء)
    {
        name: { en: 'South Sinai', ar: 'جنوب سيناء' },
        cities: [
            {
                name: { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' },
                areas: [
                    { name: { en: 'Naama Bay', ar: 'خليج نعمة' } },
                    { name: { en: 'Nabq Bay', ar: 'خليج نبق' } },
                    { name: { en: 'Old Market Area', ar: 'منطقة السوق القديم' } },
                    { name: { en: 'Hadaba District', ar: 'حي الهضبة' } }
                ]
            },
            {
                name: { en: 'Dahab', ar: 'دهب' },
                areas: [
                    { name: { en: 'Dahab City Center', ar: 'وسط دهب' } },
                    { name: { en: 'El-Mashraba Area', ar: 'منطقة المشربة' } }
                ]
            },
            {
                name: { en: 'Nuweiba', ar: 'نويبع' },
                areas: [
                    { name: { en: 'Nuweiba City Center', ar: 'وسط نويبع' } }
                ]
            }
        ]
    },

    // 27. New Valley Governorate (محافظة الوادي الجديد)
    {
        name: { en: 'New Valley', ar: 'الوادي الجديد' },
        cities: [
            {
                name: { en: 'Kharga', ar: 'الخارجة' },
                areas: [
                    { name: { en: 'Kharga City Center', ar: 'وسط البلد الخارجة' } }
                ]
            },
            {
                name: { en: 'Dakhla', ar: 'الداخلة' },
                areas: [
                    { name: { en: 'Dakhla City Center', ar: 'وسط الداخلة' } }
                ]
            }
        ]
    }
];

module.exports = { locationsData };
