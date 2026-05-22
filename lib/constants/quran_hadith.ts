export interface Verse {
  surah: string;
  verseNumber: number;
  arabic: string;
  translation: string;
  topic: string;
}

export const INHERITANCE_VERSES: Verse[] = [
  {
    surah: "An-Nisa",
    verseNumber: 11,
    arabic: "يُوصِيكُمُ ٱللَّهُ فِىٓ أَوْلَـٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَآءًۭ فَوْقَ ٱثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَٰحِدَةًۭ فَلَهَا ٱلنِّصْفُ ۚ وَلِأَبَوَيْهِ لِكُلِّ وَٰحِدٍۢ مِّنْهُمَا ٱلسُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُۥ وَلَدٌۭ ۚ فَإِن لَّمْ يَكُن لَّهُۥ وَلَدٌۭ وَوَرِثَهُۥٓ أَبَوَاهُ فَلِأُمِّهِ ٱلثُّلُثُ ۚ فَإِن كَانَ لَهُۥٓ إِخْوَةٌۭ فَلِأُمِّهِ ٱلسُّدُسُ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصِى بِهَآ أَوْ دَيْنٍ ۗ ءَابَآؤُكُمْ وَأَبْنَآؤُكُمْ لَا تَدْرُونَ أَيُّهُمْ أَقْرَبُ لَكُمْ نَفْعًۭا ۚ فَرِيضَةًۭ مِّنَ ٱللَّهِ ۗ إِنَّ ٱللَّهَ كَانَ عَلِيمًا حَكِيمًۭا",
    translation: "Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are [only] daughters, two or more, for them is two‑thirds of his estate; and if there is only one, for her is half. And for his parents, for each of them is one‑sixth of his estate if he has a child. But if he has no child and his parents are the [only] heirs, then for his mother is one‑third. And if he has brothers [or sisters], for his mother is one‑sixth, after any bequest he [may have] made or debt. Your parents or your children – you know not which of them are nearest to you in benefit. [These shares are] an obligation [imposed] by Allah. Indeed, Allah is ever Knowing and Wise.",
    topic: "children, parents",
  },
  {
    surah: "An-Nisa",
    verseNumber: 12,
    arabic: "وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَٰجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌۭ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌۭ فَلَكُمُ ٱلرُّبُعُ مِمَّا تَرَكْنَ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصِينَ بِهَآ أَوْ دَيْنٍۢ ۚ وَلَهُنَّ ٱلرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌۭ ۚ فَإِن كَانَ لَكُمْ وَلَدٌۭ فَلَهُنَّ ٱلثُّمُنُ مِمَّا تَرَكْتُم ۚ مِّنۢ بَعْدِ وَصِيَّةٍۢ تُوصُونَ بِهَآ أَوْ دَيْنٍۢ ۗ وَإِن كَانَ رَجُلٌۭ يُورَثُ كَلَـٰلَةً أَوِ ٱمْرَأَةٌۭ وَلَهُۥٓ أَخٌ أَوْ أُخْتٌۭ فَلِكُلِّ وَٰحِدٍۢ مِّنْهُمَا ٱلسُّدُسُ ۚ فَإِن كَانُوٓا۟ أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَآءُ فِى ٱلثُّلُثِ ۚ مِنۢ بَعْدِ وَصِيَّةٍۢ يُوصَىٰ بِهَآ أَوْ دَيْنٍ غَيْرَ مُضَآرٍۢ ۚ وَصِيَّةًۭ مِّنَ ٱللَّهِ ۗ وَٱللَّهُ عَلِيمٌ حَلِيمٌۭ",
    translation: "And for you is half of what your wives leave if they have no child. But if they have a child, for you is one‑fourth of what they leave, after any bequest they [may have] made or debt. And for the wives is one‑fourth if you leave no child. But if you leave a child, then for them is one‑eighth of what you leave, after any bequest you [may have] made or debt. And if a man or woman leaves neither ascendants nor descendants but has a brother or a sister, then for each of them is one‑sixth. But if they are more than two, they share a third, after any bequest which was made or debt, as long as no one is harmed. [This is] an ordinance from Allah, and Allah is Knowing and Forbearing.",
    topic: "spouse, siblings",
  },
  {
    surah: "An-Nisa",
    verseNumber: 176,
    arabic: "يَسْتَفْتُونَكَ قُلِ ٱللَّهُ يُفْتِيكُمْ فِى ٱلْكَلَـٰلَةِ ۚ إِنِ ٱمْرُؤٌا۟ هَلَكَ لَيْسَ لَهُۥ وَلَدٌۭ وَلَهُۥٓ أُخْتٌۭ فَلَهَا نِصْفُ مَا تَرَكَ ۚ وَهُوَ يَرِثُهَآ إِن لَّمْ يَكُن لَّهَا وَلَدٌۭ ۚ فَإِن كَانَتَا ٱثْنَتَيْنِ فَلَهُمَا ٱلثُّلُثَانِ مِمَّا تَرَكَ ۚ وَإِن كَانُوٓا۟ إِخْوَةًۭ رِّجَالًۭا وَنِسَآءًۭ فَلِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ ۗ يُبَيِّنُ ٱللَّهُ لَكُمْ أَن تَضِلُّوا۟ ۗ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌۢ",
    translation: "They request from you a [legal] ruling. Say, 'Allah gives you a ruling concerning one who has neither parents nor children: If a man dies leaving no child but has a sister, she will have half of what he left. And he will inherit from her if she has no child. But if there are two sisters [or more], they will have two‑thirds of what he left. If there are both brothers and sisters, the male will have the share of two females.' Allah makes clear to you [His law], lest you go astray. And Allah is Knowing of all things.",
    topic: "kalalah, siblings",
  },
];

export const HADITH: { text: string; reference: string }[] = [
  {
    text: "تعلموا الفرائض وعلموها فإنها نصف العلم وهي أول شيء ينزع من أمتي",
    reference: "رواه ابن ماجه (١٤٢٦) وابن حبان والحاكم",
  },
  {
    text: "اللهم انفعني بما علمتني وعلمني ما ينفعني وزدني علماً",
    reference: "رواه الترمذي (٣٥٩٩)",
  },
];

export default { INHERITANCE_VERSES, HADITH };
