# Fiqh (Islamic Jurisprudence) References & Sources
# مصادر الفقه الإسلامي وقواعد المواريث

## Overview

This document provides references to the Islamic jurisprudence (Fiqh) sources used in the Merath inheritance calculator. The implementation follows classical Islamic inheritance laws based on the Quran, Sunnah, and the four major schools of Islamic jurisprudence (Madhhabs).

هذا المستند يوفر مراجع لمصادر الفقه الإسلامي المستخدمة في حاسبة المواريث مراث. يتبع التطبيق قوانين المواريث الإسلامية الكلاسيكية بناءً على القرآن والسنة والمذاهب الأربعة الكبرى.

---

## Primary Sources

### 1. Quranic Versions (آيات القرآن الكريم)

#### Surah An-Nisa (Chapter 4, Verses 11-12)

The primary source for Islamic inheritance laws:

**Verse 11**:
> "Allah instructs you concerning your children: for the male a share equivalent to that of two females..."
> يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الأُنثَيَيْنِ...

**Verse 12**:
> "And for you is half of what your wives leave if they have no child..."
> وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ...

**Key Principles Established**:
- Male receives double share of female (للذكر مثل حظ الأنثيين)
- Fixed shares for specific relatives (فروض)
- Residual shares (عصبة)
- Share distribution rules

### 2. Hadith (Prophetic Traditions)

#### Sahih Bukhari & Muslim

**Inheritance of Grandfather**:
- Hadith regarding grandfather's share when competing with siblings
- Basis for grandfather rules across madhhabs

**Awl (عول) and Radd (رد)**:
- Prophetic traditions on handling excess/deficit shares
- Practical application during the Prophet's time

---

## The Four Madhhabs (المذاهب الأربعة)

### 1. Hanafi School (المذهب الحنفي)

**Founder**: Imam Abu Hanifa (الإمام أبو حنيفة)
**Period**: 8th century CE (2nd century AH)
**Geographic Influence**: South Asia, Turkey, Central Asia

**Key Characteristics**:
- Grandfather blocks siblings in most cases (الجد مع الإخوة)
- Mother gets 1/3 when with father only (الأم مع الأب فقط)
- Spouses do not receive Radd (الأزواج لا يرثون بالرد)
- Emphasis on rational reasoning (القياس)

**Primary References**:
- *Al-Mabsut* by Sarakhsi (المبسوط - السرخسي)
- *Al-Hidayah* by Marghinani (الهداية - المرغيناني)
- *Fatwa Alamgiri* (الفتوى العالمگیرية)

**Implementation in Merath**:
```typescript
const hanafiRules: MadhhabRules = {
  grandfather_with_siblings: 'hijab',      // Grandfather blocks siblings
  mother_with_father_children: 'sixth',    // Mother gets 1/6 with father+children
  mother_with_father_only: 'third',        // Mother gets 1/3 with father only
  spouse_radd: false,                      // Spouses don't get Radd
  umariyyah_rule: 'first'                 // First interpretation of Umariyyah
};
```

### 2. Maliki School (المذهب المالكي)

**Founder**: Imam Malik ibn Anas (الإمام مالك بن أنس)
**Period**: 8th century CE (2nd century AH)
**Geographic Influence**: North Africa, West Africa

**Key Characteristics**:
- Grandfather shares with siblings (المقاسمة)
- Mother gets 1/6 when with father and children
- Spouses may receive Radd in some cases
- Emphasis on practice of Medina (عمل أهل المدينة)

**Primary References**:
- *Al-Mudawwana* (الموطأ)
- *Al-Muwatta* by Imam Malik (الموطأ للإمام مالك)
- *Bulghat al-Salik* (بلغة السالك)

**Implementation in Merath**:
```typescript
const malikiRules: MadhhabRules = {
  grandfather_with_siblings: 'musharak',  // Grandfather shares with siblings
  mother_with_father_children: 'sixth',   // Mother gets 1/6
  mother_with_father_only: 'sixth',       // Mother gets 1/6
  spouse_radd: true,                       // Spouses may get Radd
  umariyyah_rule: 'second'                // Second interpretation
};
```

### 3. Shafii School (المذهب الشافعي)

**Founder**: Imam Muhammad ibn Idris al-Shafii (الإمام محمد بن إدريس الشافعي)
**Period**: 8th-9th century CE (2nd-3rd century AH)
**Geographic Influence**: Southeast Asia, Egypt, Yemen, East Africa

**Key Characteristics**:
- Musharraka (المشاركة) - Grandfather shares with full siblings
- Akdariyya (الأكدرية) - Special case for grandfather with single sister
- Mother gets 1/3 of remainder with father and children
- Balanced approach between text and reason

**Primary References**:
- *Al-Umm* (الأم)
- *Kitab al-Risala* (رسالة الشافعي)
- *Reliance of the Traveller* (عمدة السالك)

**Special Cases**:

#### Musharraka (المشاركة)
- Grandfather and full siblings share inheritance
- Conditions: No father, no male descendants
- Grandfather treated like a brother in distribution

#### Akdariyya (الأكدرية)
- Named after Akdarah case
- Grandfather with single sister
- Grandfather gets 1/2, sister gets 1/2 (reduced from 1/2)
- Some scholars consider it a rare case

**Implementation in Merath**:
```typescript
const shafiiRules: MadhhabRules = {
  grandfather_with_siblings: 'musharak',   // Musharraka applies
  mother_with_father_children: 'third_of_remainder', // 1/3 of remainder
  mother_with_father_only: 'third',         // Mother gets 1/3
  spouse_radd: false,                       // Spouses don't get Radd
  umariyyah_rule: 'first'                  // First interpretation
};
```

### 4. Hanbali School (المذهب الحنبلي)

**Founder**: Imam Ahmad ibn Hanbal (الإمام أحمد بن حنبل)
**Period**: 9th century CE (3rd century AH)
**Geographic Influence**: Arabian Peninsula, parts of Syria

**Key Characteristics**:
- Similar to Shafii in many rules
- Strict adherence to Hadith
- Conservative approach to special cases
- Grandfather blocks siblings (like Hanafi)

**Primary References**:
- *Al-Mughni* by Ibn Qudamah (المغني لابن قدامة)
- *Sharh al-Muntakhab* (شرح المنتخب)
- *Kashf al-Qina* (كشف القناع)

**Implementation in Merath**:
```typescript
const hanbaliRules: MadhhabRules = {
  grandfather_with_siblings: 'hijab',      // Grandfather blocks siblings
  mother_with_father_children: 'sixth',    // Mother gets 1/6
  mother_with_father_only: 'third',        // Mother gets 1/3
  spouse_radd: false,                      // Spouses don't get Radd
  umariyyah_rule: 'first'                 // First interpretation
};
```

---

## Fixed Shares (الفروض المقدرة)

The following fixed shares are established in the Quran and implemented across all madhhabs:

| Heir | Share | Condition | Quranic Reference |
|------|-------|-----------|-------------------|
| Husband | 1/2 | Wife has no children | Surah An-Nisa 4:12 |
| Husband | 1/4 | Wife has children | Surah An-Nisa 4:12 |
| Wife | 1/4 | Husband has no children | Surah An-Nisa 4:12 |
| Wife | 1/8 | Husband has children | Surah An-Nisa 4:12 |
| Daughter | 1/2 | Single daughter, no son | Surah An-Nisa 4:11 |
| Daughters | 2/3 | Two or more daughters, no son | Surah An-Nisa 4:11 |
| Son's Daughter | 1/2 | Single granddaughter, no son/grandson | Ijma (Consensus) |
| Son's Daughters | 2/3 | Two+ granddaughters, no son/grandson | Ijma |
| Father | 1/6 | Has children | Surah An-Nisa 4:11 |
| Father | Residual | No children, blocks siblings | Surah An-Nisa 4:11 |
| Mother | 1/6 | Has children or siblings | Surah An-Nisa 4:11 |
| Mother | 1/3 | No children, no siblings | Surah An-Nisa 4:11 |
| Grandfather | 1/6 | No father | Ijma |
| Grandmother | 1/6 | No mother | Ijma |
| Full Sister | 1/2 | Single, no male siblings | Surah An-Nisa 4:176 |
| Full Sisters | 2/3 | Two+ sisters, no male siblings | Surah An-Nisa 4:176 |
| Paternal Sister | 1/2 | Single, no closer male relatives | Ijma |
| Paternal Sisters | 2/3 | Two+, no closer male relatives | Ijma |
| Maternal Sibling | 1/6 | Single or multiple, share 1/3 | Surah An-Nisa 4:12 |

---

## Special Cases (الحالات الخاصة)

### 1. Awl (عول) - When Shares Exceed Estate

**Definition**: When fixed shares sum to more than 1 (100% of estate).

**Example**: Wife (1/8) + Father (1/6) + Mother (1/6) + Two Daughters (2/3)
- Sum: 1/8 + 1/6 + 1/6 + 2/3 = 3/24 + 4/24 + 4/24 + 16/24 = 27/24 = 1.125

**Solution**: Proportionally reduce all shares (all madhhabs except some Hanafi views).

**Reference**: Classical Hanafi, Maliki, Shafii, Hanbali fiqh texts.

### 2. Radd (رد) - When Shares Are Less Than Estate

**Definition**: When fixed shares sum to less than 1, remainder returns to fixed sharers.

**Example**: Single daughter (1/2) - remaining 1/2 returned to daughter via Radd.

**Madhab Differences**:
- **Hanafi**: Spouses do not receive Radd
- **Maliki**: Spouses may receive Radd
- **Shafii**: Spouses do not receive Radd
- **Hanbali**: Spouses do not receive Radd

### 3. Hijab (حجب) - Inheritance Blocking

**Complete Hijab (حجب حرمان)**: Heir is completely excluded from inheritance.

**Partial Hijab (حجب نقصان)**: Heir's share is reduced.

**Examples**:
- Son blocks all siblings (completely)
- Father blocks grandfather (completely)
- Daughter blocks grandson (partially)

### 4. Blood Relatives (ذوو الأرحام)

**Definition**: Distant relatives who inherit when no fixed sharers or asaba exist.

**Priority Classes**:
1. Children of daughters (first preference)
2. Children of sisters (second preference)
3. Maternal uncles/aunts (third preference)
4. Paternal aunts (fourth preference)

**Reference**: Consensus across madhhabs with minor variations.

---

## Algorithm Implementation References

### Fixed Shares Calculation

Based on:
- Quranic shares (Surah An-Nisa)
- Ijma (scholarly consensus) for shares not explicitly mentioned
- Madhab-specific interpretations

### Residual Shares (Asaba - العصبة)

Based on:
- Quranic verse 4:12 for asaba rules
- Prophetic Hadith on asaba priority
- Madhab-specific asaba hierarchies

### Special Case Algorithms

**Musharraka**:
- Source: Shafii school texts
- Algorithm: Grandfather treated as brother in distribution
- Reference: *Al-Umm* by Imam Shafii

**Akdariyya**:
- Source: Named after Akdarah case study
- Algorithm: Special distribution for grandfather + single sister
- Reference: Shafii and Hanafi commentaries

**Grandfather Optimal Selection**:
- Source: Comparative fiqh analysis
- Algorithm: Evaluate muqasamah, 1/6, and 1/3 options
- Reference: *Al-Mughni* by Ibn Qudamah

---

## Validation & Scholarly Review

### Scholarly Consultation

For production use, it is recommended to:
1. Consult with Islamic scholars (علماء الشرع) for validation
2. Cross-reference calculations with classical fiqh texts
3. Obtain fatwa (إفتاء) for complex cases
4. Regularly review implementation against scholarly consensus

### Academic References

For academic study and research:
1. *Al-Mughni* by Ibn Qudamah (comprehensive comparative fiqh)
2. *Al-Mabsut* by Sarakshi (Hanafi detailed analysis)
3. *Hidayah* (simplified Hanafi guide)
4. *Reliance of the Traveller* (Shafii summary)
5. Contemporary comparative fiqh works

---

## Implementation Notes

### Accuracy Disclaimer

While every effort has been made to implement accurate inheritance calculations:
- This software is for educational and reference purposes
- For legal inheritance matters, consult qualified Islamic scholars
- Local laws and regulations may vary by jurisdiction
- Complex family situations may require scholarly review

### Continuous Improvement

The implementation is regularly reviewed and updated based on:
- Scholarly feedback
- User testing and validation
- Comparative analysis with classical texts
- Community review and contribution

---

## Bibliography

### Primary Sources
1. Holy Quran, Surah An-Nisa (Chapter 4)
2. Sahih al-Bukhari, Book of Inheritance
3. Sahih Muslim, Book of Inheritance

### Classical Fiqh Texts
1. *Al-Mughni* - Ibn Qudamah (Hanbali)
2. *Al-Mabsut* - Sarakhsi (Hanafi)
3. *Al-Hidayah* - Marghinani (Hanafi)
4. *Al-Umm* - Imam Shafii (Shafii)
5. *Al-Muwatta* - Imam Malik (Maliki)

### Contemporary References
1. *Islamic Law of Inheritance* - Dr. Muhammad Hashim Kamali
2. *The Islamic Law of Succession* - Satish Chandra
3. *Mawarith* - Online Islamic inheritance resources

---

## Contact & Support

For fiqh-related questions or clarifications:
- Consult local Islamic scholars
- Reference classical fiqh texts
- Join Islamic law academic communities
- Contact the project maintainers for technical implementation questions

**Note**: This document is part of the Merath Islamic Inheritance Calculator project. For technical documentation, see the main API documentation.

---

*Last Updated: June 2026*
*صنع بحب للمجتمع المسلم*