export interface GlossaryTerm {
  term: string;
  termAr: string;
  definition: string;
  definitionAr: string;
  category: 'general' | 'heir' | 'hijab' | 'special';
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Faraid",
    termAr: "الفرائض",
    definition: "The science of Islamic inheritance law, derived from the Quran, Sunnah, and scholarly consensus. It specifies the shares of each heir.",
    definitionAr: "علم الفرائض: هو العلم الذي يبحث في أنصبة الورثة وتوزيع التركة وفق الشريعة الإسلامية.",
    category: "general",
  },
  {
    term: "Estate (Tarika)",
    termAr: "التركة",
    definition: "All property, rights, and assets left by the deceased.",
    definitionAr: "التركة: جميع ما يتركه الميت من مال أو حقوق أو ممتلكات.",
    category: "general",
  },
  {
    term: "Heir (Warith)",
    termAr: "الوارث",
    definition: "A person entitled to inherit from the deceased.",
    definitionAr: "الوارث: الشخص المستحق لجزء من التركة.",
    category: "general",
  },
  {
    term: "Fixed Share (Fardh)",
    termAr: "فرض",
    definition: "A prescribed portion of the estate, set by the Quran and Sunnah (e.g., 1/2, 1/4, 1/8, 2/3, 1/3, 1/6).",
    definitionAr: "الفرض: النصيب المحدد شرعاً للوارث، مثل النصف والربع والثمن والثلثين والثلث والسدس.",
    category: "general",
  },
  {
    term: "Asaba (Residuary)",
    termAr: "العصبة",
    definition: "Heirs who take the remaining estate after fixed shares are distributed. If there are no fixed‑share heirs, they inherit everything.",
    definitionAr: "العصبة: الورثة الذين يرثون ما تبقى من التركة بعد أصحاب الفروض، أو يأخذون التركة كلها إن لم يوجد أصحاب فروض.",
    category: "general",
  },
  {
    term: "Dhawu al‑Arham",
    termAr: "ذوو الأرحام",
    definition: "Distant relatives who are neither fixed‑share heirs nor residuaries. They inherit only when no closer heirs exist (in Shafii and Hanbali schools).",
    definitionAr: "ذوو الأرحام: الأقارب البعيدون الذين ليسوا بأصحاب فروض ولا عصبات، يرثون عند عدم وجود الورثة الأقرب (في المذهب الشافعي والحنبلي).",
    category: "general",
  },
  {
    term: "Awl (Increase)",
    termAr: "العول",
    definition: "A situation where the total sum of fixed shares exceeds the estate. The shares are proportionally reduced by increasing the denominator (base).",
    definitionAr: "العول: زيادة في مجموع سهام أصحاب الفروض عن أصل التركة، فيُزاد المقام لتوزيع التركة بنسبة متساوية.",
    category: "special",
  },
  {
    term: "Radd (Return)",
    termAr: "الرد",
    definition: "When the fixed shares do not consume the entire estate and there are no residuaries, the surplus is returned to the fixed‑share heirs (except spouse in some schools).",
    definitionAr: "الرد: فائض التركة بعد أصحاب الفروض وعدم وجود عصبة، يُرد على أصحاب الفروض (باستثناء الزوجين في بعض المذاهب).",
    category: "special",
  },
  {
    term: "Hijab (Exclusion)",
    termAr: "الحجب",
    definition: "The prevention of an heir from receiving inheritance, either entirely (complete hijab) or partially (deprivation hijab), due to the presence of a closer heir.",
    definitionAr: "الحجب: منع الوارث من الإرث كلياً (حجب حرمان) أو جزئياً (حجب نقصان) بسبب وجود وارث أقرب.",
    category: "hijab",
  },
  {
    term: "Umariyyah",
    termAr: "العُمَريَّة",
    definition: "Special case: spouse + father + mother (no children). The mother takes 1/3 of the remainder after the spouse's share, not 1/3 of the whole.",
    definitionAr: "العُمَريَّة: مسألة خاصة: زوج/زوجة + أب + أم (بدون فرع وارث)، تأخذ الأم ثلث الباقي بعد نصيب الزوج/الزوجة، لا ثلث التركة كلها.",
    category: "special",
  },
  {
    term: "Musharraka",
    termAr: "المشتركة",
    definition: "Special case (Shafii only): husband + mother + maternal siblings (2+) + full sibling. Full siblings share 1/3 equally with maternal siblings.",
    definitionAr: "المشتركة: مسألة خاصة (الشافعي): زوج + أم + إخوة لأم (2+) + أخ شقيق، يشترك الأشقاء مع الإخوة لأم في الثلث بالتساوي.",
    category: "special",
  },
  {
    term: "Akdariyya",
    termAr: "الأكدرية",
    definition: "Complex case: husband + mother + grandfather + full sister. The grandfather and sister are treated as partners in the remainder.",
    definitionAr: "الأكدرية: مسألة معقدة: زوج + أم + جد + أخت شقيقة، يُعامل الجد والأخت كشريكين في الباقي.",
    category: "special",
  },
];

export default GLOSSARY;
