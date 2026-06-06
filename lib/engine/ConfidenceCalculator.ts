import type { HeirsData, HeirShare, EngineState } from './types';

export class ConfidenceCalculator {
  constructor(
    private state: EngineState,
    private specialCases: Array<{ type: string; name: string; description: string }>
  ) {}

  calculateConfidence(_results: HeirShare[], heirs: HeirsData): number {
    void _results;
    let confidence = 100;
    const factors: string[] = [];

    const heirCount = Object.values(heirs).filter((v) => v && v > 0).length;
    if (heirCount > 8) {
      confidence -= 15;
      factors.push('عدد كبير من الورثة (أكثر من 8)');
    } else if (heirCount > 5) {
      confidence -= 10;
      factors.push('عدد متوسط من الورثة (6-8)');
    } else if (heirCount > 3) {
      confidence -= 5;
      factors.push('عدد قليل من الورثة (4-5)');
    }

    if (this.state.awlApplied) {
      confidence -= 8;
      factors.push('تم تطبيق العول');
    }

    if (this.state.raddApplied) {
      confidence -= 5;
      factors.push('تم تطبيق الرد');
    }

    if (this.state.bloodRelativesApplied) {
      confidence -= 10;
      factors.push('تم توزيع الباقي على ذوي الأرحام');
    }

    if (this.specialCases.some((sc) => sc.type === 'musharraka')) {
      confidence -= 8;
      factors.push('المسألة المشتركة (الحمارية)');
    }

    if (this.specialCases.some((sc) => sc.type === 'akdariyya')) {
      confidence -= 12;
      factors.push('مسألة الأكدرية');
    }

    const hasChildren = heirs.son || heirs.daughter;
    const hasParents = heirs.father || heirs.mother;
    const hasGrandparents =
      heirs.grandfather || heirs.grandmother_mother || heirs.grandmother_father;

    const generationCount =
      (hasChildren ? 1 : 0) + (hasParents ? 1 : 0) + (hasGrandparents ? 1 : 0);
    if (generationCount >= 3) {
      confidence -= 5;
      factors.push('وجود عدة أجيال من الورثة');
    }

    const distantHeirs = [
      'full_nephew',
      'paternal_nephew',
      'full_uncle',
      'paternal_uncle',
      'full_cousin',
      'paternal_cousin',
      'daughter_son',
      'daughter_daughter',
      'sister_children',
      'maternal_uncle',
      'maternal_aunt',
      'paternal_aunt',
    ];

    const hasDistantHeirs = distantHeirs.some((key) => (heirs[key as keyof HeirsData] || 0) > 0);
    if (hasDistantHeirs) {
      confidence -= 8;
      factors.push('وجود ورثة من الدرجات البعيدة');
    }

    const hasGrandfatherWithSiblings =
      heirs.grandfather && (heirs.full_brother || heirs.paternal_brother);
    if (hasGrandfatherWithSiblings) {
      confidence -= 5;
      factors.push('حالة الجد مع الإخوة (تختلف باختلاف المذهب)');
    }

    if (heirs.wife && heirs.wife > 1) {
      confidence -= 3;
      factors.push('وجود عدة زوجات');
    }

    confidence = Math.max(50, Math.min(100, confidence));

    this.state.confidenceFactors = [];

    if (factors.length > 0) {
      this.state.confidenceFactors = factors;
    } else {
      this.state.confidenceFactors = ['حساب بسيط - دقة عالية'];
    }

    return confidence;
  }
}
