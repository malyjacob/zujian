import {
  QuestionType,
  Difficulty,
  Year,
  Grade,
  Source,
  Semester,
  Category,
} from '../types';

const BASE_URL = 'https://zujuan.xkw.com';

export class UrlBuilder {
  private knowledgeId: string;
  private grade: string;
  private typePart: string = '';
  private difficultyPart: string = '';
  private yearPart: string = '';
  private gradePart: string = '';
  private pagePart: string = '';

  constructor(knowledgeId: string, grade: '高中' | '初中' = '高中') {
    this.knowledgeId = knowledgeId;
    this.grade = grade;
  }

  private getGradePrefix(): string {
    return this.grade === '高中' ? 'gzsx' : 'czsx';
  }

  private validateType(type: QuestionType): boolean {
    const validTypes: QuestionType[] = ['t1', 't2', 't3', 't4', 't5', 't6'];
    return validTypes.includes(type);
  }

  private validateDifficulty(difficulty: Difficulty): boolean {
    const validDifficulties: Difficulty[] = ['d1', 'd2', 'd3', 'd4', 'd5'];
    return validDifficulties.includes(difficulty);
  }

  private validateYear(year: Year): boolean {
    const validYears: Year[] = [2023, 2024, 2025, 2026];
    return validYears.includes(year);
  }

  private validateGrade(grade: Grade): boolean {
    const validGrades: Grade[] = ['g1', 'g2', 'g3'];
    return validGrades.includes(grade);
  }

  setType(type: QuestionType, multiCount?: number, fillCount?: number): this {
    if (!this.validateType(type)) return this;

    // t1=单选题, t2=多选题, t3=填空题, t4=解答题
    const typeMap: Record<string, string> = {
      t1: '2701',
      t2: '2704',
      t3: '2702',
      t4: '2703',
    };

    const baseType = typeMap[type];
    if (!baseType) return this;

    // 多选题: qt2704 + 01(2个)/02(3个)/03(4个及以上)
    if (type === 't2' && multiCount !== undefined) {
      if (multiCount >= 4) {
        this.typePart = `qt270403`;
      } else if (multiCount >= 2) {
        this.typePart = `qt27040${multiCount}`;
      }
    }
    // 填空题: qt2702 + 01(单空)/02(双空)/03(多空)
    else if (type === 't3' && fillCount !== undefined) {
      if (fillCount >= 3) {
        this.typePart = `qt270203`;
      } else if (fillCount >= 1) {
        this.typePart = `qt27020${fillCount}`;
      }
    } else {
      this.typePart = `qt${baseType}`;
    }

    return this;
  }

  setDifficulty(difficulty: Difficulty): this {
    if (this.validateDifficulty(difficulty)) {
      this.difficultyPart = `d${difficulty.slice(1)}`;
    }
    return this;
  }

  setYear(year: Year): this {
    if (this.validateYear(year)) {
      this.yearPart = `y${year}`;
    }
    return this;
  }

  setGrade(grade: Grade): this {
    if (this.validateGrade(grade)) {
      this.gradePart = `g${grade.slice(1)}`;
    }
    return this;
  }

  setSource(source: Source): this {
    // Not used in new URL format
    return this;
  }

  setRegion(regionId: string): this {
    // Not used in new URL format
    return this;
  }

  setSemester(semester: Semester): this {
    // Not used in new URL format
    return this;
  }

  setCategory(category: Category): this {
    // Not used in new URL format
    return this;
  }

  setPage(page: number): this {
    if (page > 1) {
      this.pagePart = `o2p${page}`;
    } else {
      this.pagePart = 'o2';
    }
    return this;
  }

  build(): string {
    const gradePrefix = this.getGradePrefix();
    const parts: string[] = [];

    // Order: 题型 → 难度 → 年份 → o2/p{page} (直接拼接，无分隔符)
    if (this.typePart) parts.push(this.typePart);
    if (this.difficultyPart) parts.push(this.difficultyPart);
    if (this.yearPart) parts.push(this.yearPart);
    parts.push(this.pagePart || 'o2');

    // Strip 'zsd' prefix if present to avoid duplication
    const knowledgeId = this.knowledgeId.replace(/^zsd/, '');
    let url = `${BASE_URL}/${gradePrefix}/zsd${knowledgeId}/`;
    if (parts.length > 0) {
      url += parts.join('') + '/';
    }

    return url;
  }

  static buildUrl(
    knowledgeId: string,
    options: {
      type?: QuestionType;
      difficulty?: Difficulty;
      year?: Year;
      grade?: Grade;
      source?: Source;
      region?: string;
      semester?: Semester;
      category?: Category;
      page?: number;
      multiCount?: number;
      fillCount?: number;
    },
    grade: '高中' | '初中' = '高中'
  ): string {
    const builder = new UrlBuilder(knowledgeId, grade);

    if (options.type) builder.setType(options.type, options.multiCount, options.fillCount);
    if (options.difficulty) builder.setDifficulty(options.difficulty);
    if (options.year) builder.setYear(options.year);
    if (options.grade) builder.setGrade(options.grade);
    if (options.page) builder.setPage(options.page);

    return builder.build();
  }
}
