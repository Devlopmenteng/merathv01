export interface Verse {
  surah: string;
  verseNumber: number;
  arabic: string;
  translation: string;
  translations: {
    en: string;
    ms?: string;
    ur?: string;
  };
  topic: string;
}

export const INHERITANCE_VERSES: Verse[] = [
  {
    surah: 'An-Nisa',
    verseNumber: 11,
    arabic:
      'يُوصِيكُمُ ٱللَّهُ فِىٓ أَوْلَـٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَآءًۭ فَوْقَ ٱثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَٰحِدَةًۭ فَلَهَا ٱلنِّصْفُ ۚ وَلِأَبَوَيْهِ لِكُلِّ وَٰحِدٍۢ مِّنْهُمَا ٱلسُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُۥ وَلَدٌۭ ۚ فَإِن لَّمْ يَكُن لَّهُۥ وَلَدٌۭ وَوَرِثَهُۥٓ أَبَوَاهُ فَلِأُمِّهِ ٱلثُّلُثُ ۚ فَإِن كَانَ لَهُۥٓ إِخْوَةٌۭ فَلِأُمِّهِ ٱلسُّدُسُ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصِى بِهَآ أَوْ دَيْنٍ ۗ ءَابَآؤُكُمْ وَأَبْنَآؤُكُمْ لَا تَدْرُونَ أَيُّهُمْ أَقْرَبُ لَكُمْ نَفْعًۭا ۚ فَرِيضَةًۭ مِّنَ ٱللَّهِ ۗ إِنَّ ٱللَّهَ كَانَ عَلِيمًا حَكِيمًۭا',
    translation:
      'Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are [only] daughters, two or more, for them is two‑thirds of his estate; and if there is only one, for her is half. And for his parents, for each of them is one‑sixth of his estate if he has a child. But if he has no child and his parents are the [only] heirs, then for his mother is one‑third. And if he has brothers [or sisters], for his mother is one‑sixth, after any bequest he [may have] made or debt. Your parents or your children – you know not which of them are nearest to you in benefit. [These shares are] an obligation [imposed] by Allah. Indeed, Allah is ever Knowing and Wise.',
    translations: {
      en: 'Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are [only] daughters, two or more, for them is two‑thirds of his estate; and if there is only one, for her is half. And for his parents, for each of them is one‑sixth of his estate if he has a child. But if he has no child and his parents are the [only] heirs, then for his mother is one‑third. And if he has brothers [or sisters], for his mother is one‑sixth, after any bequest he [may have] made or debt. Your parents or your children – you know not which of them are nearest to you in benefit. [These shares are] an obligation [imposed] by Allah. Indeed, Allah is ever Knowing and Wise.',
      ms: 'Allah berwasiat kepada kamu tentang anak-anak kamu, iaitu bahagian seorang anak lelaki menyamai bahagian dua orang anak perempuan. Tetapi jika anak-anak perempuan itu lebih dari dua, maka bahagian mereka ialah dua pertiga dari harta yang ditinggalkan. Dan jika anak perempuan itu seorang sahaja, maka bahagiannya ialah separuh harta. Dan bagi ibu bapa si mati, tiap-tiap seorang dari keduanya mendapat satu perenam dari harta yang ditinggalkan, jika si mati mempunyai anak. Jika si mati tidak mempunyai anak dan yang mewarisinya hanyalah ibu bapanya, maka ibunya mendapat satu pertiga. Jika si mati mempunyai beberapa orang saudara, maka ibunya mendapat satu perenam, setelah ditunaikan wasiat yang dibuatnya atau hutangnya. Ibu bapa kamu dan anak-anak kamu, kamu tidak mengetahui siapa di antara mereka yang lebih dekat manfaatnya kepada kamu. [Ini adalah] ketetapan dari Allah. Sesungguhnya Allah Maha Mengetahui lagi Maha Bijaksana.',
      ur: 'اللہ تمہیں تمہاری اولاد کے بارے میں حکم دیتا ہے: ایک مرد کا حصہ دو عورتوں کے برابر ہے۔ اگر صرف لڑکیاں ہوں اور دو سے زیادہ ہوں تو ان کا حصہ کل ترکے کا دو تہائی ہے۔ اور اگر صرف ایک لڑکی ہو تو اس کا حصہ آدھا ہے۔ اور میت کے والدین میں سے ہر ایک کو اس کے ترکے کا چھٹا حصہ ملے گا اگر اس کی اولاد ہو۔ اگر اولاد نہ ہو اور والدین ہی وارث ہوں تو ماں کو تہائی ملے گا۔ اور اگر میت کے بھائی بہن ہوں تو ماں کو چھٹا حصہ ملے گا، وصیت یا قرض کی ادائیگی کے بعد۔ تمہارے باپ اور تمہارے بیٹے، تم نہیں جانتے کہ ان میں سے کون تمہیں زیادہ نفع پہنچانے والا ہے۔ یہ اللہ کی طرف سے فرض ہے۔ بے شک اللہ علم والا، حکمت والا ہے۔',
    },
    topic: 'children, parents',
  },
  {
    surah: 'An-Nisa',
    verseNumber: 12,
    arabic:
      'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَٰجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌۭ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌۭ فَلَكُمُ ٱلرُّبُعُ مِمَّا تَرَكْنَ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصِينَ بِهَآ أَوْ دَيْنٍۢ ۚ وَلَهُنَّ ٱلرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌۭ ۚ فَإِن كَانَ لَكُمْ وَلَدٌۭ فَلَهُنَّ ٱلثُّمُنُ مِمَّا تَرَكْتُم ۚ مِّنۢ بَعْدِ وَصِيَّةٍۢ تُوصُونَ بِهَآ أَوْ دَيْنٍۢ ۗ وَإِن كَانَ رَجُلٌۭ يُورَثُ كَلَـٰلَةً أَوِ ٱمْرَأَةٌۭ وَلَهُۥٓ أَخٌ أَوْ أُخْتٌۭ فَلِكُلِّ وَٰحِدٍۢ مِّنْهُمَا ٱلسُّدُسُ ۚ فَإِن كَانُوٓا۟ أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَآءُ فِى ٱلثُّلُثِ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصَىٰ بِهَآ أَوْ دَيْنٍ غَيْرَ مُضَآرٍۢ ۚ وَصِيَّةًۭ مِّنَ ٱللَّهِ ۗ وَٱللَّهُ عَلِيمٌ حَلِيمٌۭ',
    translation:
      'And for you is half of what your wives leave if they have no child. But if they have a child, for you is one‑fourth of what they leave, after any bequest they [may have] made or debt. And for the wives is one‑fourth if you leave no child. But if you leave a child, then for them is one‑eighth of what you leave, after any bequest you [may have] made or debt. And if a man or woman leaves neither ascendants nor descendants but has a brother or a sister, then for each of them is one‑sixth. But if they are more than two, they share a third, after any bequest which was made or debt, as long as no one is harmed. [This is] an ordinance from Allah, and Allah is Knowing and Forbearing.',
    translations: {
      en: 'And for you is half of what your wives leave if they have no child. But if they have a child, for you is one‑fourth of what they leave, after any bequest they [may have] made or debt. And for the wives is one‑fourth if you leave no child. But if you leave a child, then for them is one‑eighth of what you leave, after any bequest you [may have] made or debt. And if a man or woman leaves neither ascendants nor descendants but has a brother or a sister, then for each of them is one‑sixth. But if they are more than two, they share a third, after any bequest which was made or debt, as long as no one is harmed. [This is] an ordinance from Allah, and Allah is Knowing and Forbearing.',
      ms: 'Dan bagi kamu separuh dari harta yang ditinggalkan oleh isteri-isteri kamu jika mereka tidak mempunyai anak. Tetapi jika mereka mempunyai anak, maka bagi kamu satu perempat dari harta yang mereka tinggalkan, setelah ditunaikan wasiat yang mereka buat atau hutang mereka. Dan bagi isteri-isteri kamu satu perempat dari harta yang kamu tinggalkan jika kamu tidak mempunyai anak. Tetapi jika kamu mempunyai anak, maka bagi isteri-isteri kamu satu perlapan dari harta yang kamu tinggalkan, setelah ditunaikan wasiat yang kamu buat atau hutang kamu. Dan jika seorang lelaki atau perempuan yang meninggal dunia tidak meninggalkan ibu bapa atau anak, tetapi mempunyai saudara lelaki atau saudara perempuan, maka bagi setiap seorang dari keduanya satu perenam. Tetapi jika mereka lebih dari dua, maka mereka bersekutu dalam satu pertiga, setelah ditunaikan wasiat yang dibuat atau hutang, dengan tidak memberi mudarat. [Ini adalah] wasiat dari Allah. Dan Allah Maha Mengetahui lagi Maha Penyantun.',
      ur: 'اور تمہارے لیے تمہاری بیویوں کے ترکے کا آدھا حصہ ہے اگر ان کی اولاد نہ ہو۔ اور اگر ان کی اولاد ہو تو تمہارے لیے ان کے ترکے کا چوتھائی حصہ ہے، وصیت یا قرض کی ادائیگی کے بعد۔ اور بیویوں کے لیے تمہارے ترکے کا چوتھائی حصہ ہے اگر تمہاری اولاد نہ ہو۔ اور اگر تمہاری اولاد ہو تو ان کے لیے تمہارے ترکے کا آٹھواں حصہ ہے، وصیت یا قرض کی ادائیگی کے بعد۔ اور اگر کوئی مرد یا عورت کلالہ کی حیثیت سے مرے اور اس کا ایک بھائی یا بہن ہو تو ہر ایک کے لیے چھٹا حصہ ہے۔ اور اگر وہ اس سے زیادہ ہوں تو وہ تہائی میں شریک ہوں گے، وصیت یا قرض کی ادائیگی کے بعد، بغیر کسی کو نقصان پہنچائے۔ یہ اللہ کی طرف سے حکم ہے۔ اور اللہ علم والا، بردبار ہے۔',
    },
    topic: 'spouse, siblings',
  },
  {
    surah: 'An-Nisa',
    verseNumber: 176,
    arabic:
      'يَسْتَفْتُونَكَ قُلِ ٱللَّهُ يُفْتِيكُمْ فِى ٱلْكَلَـٰلَةِ ۚ إِنِ ٱمْرُؤٌا۟ هَلَكَ لَيْسَ لَهُۥ وَلَدٌۭ وَلَهُۥٓ أُخْتٌۭ فَلَهَا نِصْفُ مَا تَرَكَ ۚ وَهُوَ يَرِثُهَآ إِن لَّمْ يَكُن لَّهَا وَلَدٌۭ ۚ فَإِن كَانَتَا ٱثْنَتَيْنِ فَلَهُمَا ٱلثُّلُثَانِ مِمَّا تَرَكَ ۚ وَإِن كَانُوٓا۟ إِخْوَةًۭ رِّجَالًۭا وَنِسَآءًۭ فَلِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ ۗ يُبَيِّنُ ٱللَّهُ لَكُمْ أَن تَضِلُّوا۟ ۗ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌۢ',
    translation:
      "They request from you a [legal] ruling. Say, 'Allah gives you a ruling concerning one who has neither parents nor children: If a man dies leaving no child but has a sister, she will have half of what he left. And he will inherit from her if she has no child. But if there are two sisters [or more], they will have two‑thirds of what he left. If there are both brothers and sisters, the male will have the share of two females.' Allah makes clear to you [His law], lest you go astray. And Allah is Knowing of all things.",
    translations: {
      en: "They request from you a [legal] ruling. Say, 'Allah gives you a ruling concerning one who has neither parents nor children: If a man dies leaving no child but has a sister, she will have half of what he left. And he will inherit from her if she has no child. But if there are two sisters [or more], they will have two‑thirds of what he left. If there are both brothers and sisters, the male will have the share of two females.' Allah makes clear to you [His law], lest you go astray. And Allah is Knowing of all things.",
      ms: 'Mereka meminta fatwa kepadamu. Katakanlah: "Allah memberi fatwa kepadamu tentang kalalah." Jika seorang mati yang tidak mempunyai anak, dan ia mempunyai seorang saudara perempuan, maka bagi saudara perempuan itu separuh dari harta yang ditinggalkannya. Dan saudara lelaki mewarisi saudara perempuan jika ia tidak mempunyai anak. Jika dua saudara perempuan, maka bagi mereka dua pertiga dari harta yang ditinggalkan. Dan jika mereka bersaudara lelaki dan perempuan, maka bahagian seorang lelaki sama dengan bahagian dua orang perempuan. Allah menerangkan kepada kamu supaya kamu tidak sesat. Dan Allah Maha Mengetahui segala sesuatu.',
      ur: 'لوگ آپ سے فتویٰ پوچھتے ہیں۔ کہہ دیجیے: "اللہ تمہیں کلالہ کے بارے میں فتویٰ دیتا ہے۔" اگر کوئی مرد مر جائے جس کی اولاد نہ ہو اور اس کی ایک بہن ہو تو اسے آدھا ترکہ ملے گا۔ اور وہ اس کی وارث ہوگا اگر اس کی اولاد نہ ہو۔ اگر دو بہنیں ہوں تو انہیں دو تہائی ملے گا۔ اور اگر بھائی اور بہنیں ہوں تو مرد کا حصہ دو عورتوں کے برابر ہے۔ اللہ تمہارے لیے واضح کرتا ہے تاکہ تم گمراہ نہ ہو۔ اور اللہ ہر چیز کا علم رکھنے والا ہے۔',
    },
    topic: 'kalalah, siblings',
  },
];

export const HADITH: { text: string; reference: string }[] = [
  {
    text: 'تعلموا الفرائض وعلموها فإنها نصف العلم وهي أول شيء ينزع من أمتي',
    reference: 'رواه ابن ماجه (١٤٢٦) وابن حبان والحاكم',
  },
  {
    text: 'اللهم انفعني بما علمتني وعلمني ما ينفعني وزدني علماً',
    reference: 'رواه الترمذي (٣٥٩٩)',
  },
];

export default { INHERITANCE_VERSES, HADITH };
