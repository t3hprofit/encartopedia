// The nine Areas of Interest, exact Encarta '95 labels, each with its own
// accent color and margin watermark. Subcategories map to Wikipedia categories.

export interface Area {
  id: string
  label: string
  accent: string
  accentText: string
  /** emoji-free line-art watermark glyph drawn as an SVG path id in Watermark.tsx */
  watermark: WatermarkKind
  subcategories: Subcategory[]
}

export interface Subcategory {
  label: string
  /** Wikipedia category names (without the "Category:" prefix) */
  wikiCategories: string[]
}

export type WatermarkKind =
  | 'gear'
  | 'leaf'
  | 'globe'
  | 'column'
  | 'quill'
  | 'lamp'
  | 'brush'
  | 'mask'
  | 'ball'

export const AREAS: Area[] = [
  {
    id: 'physical',
    label: 'Physical Science & Technology',
    accent: '#5b7fa6',
    accentText: '#eaf1f8',
    watermark: 'gear',
    subcategories: [
      { label: 'Astronomy & Space Science', wikiCategories: ['Astronomy', 'Space_exploration'] },
      { label: 'Physics', wikiCategories: ['Physics'] },
      { label: 'Chemistry', wikiCategories: ['Chemistry'] },
      { label: 'Computers & Electronics', wikiCategories: ['Computing', 'Electronics'] },
      { label: 'Transportation', wikiCategories: ['Transport'] },
      { label: 'Inventions & Inventors', wikiCategories: ['Inventions', 'Inventors'] },
    ],
  },
  {
    id: 'life',
    label: 'Life Science',
    accent: '#4e7d4e',
    accentText: '#ecf5ec',
    watermark: 'leaf',
    subcategories: [
      { label: 'Animals', wikiCategories: ['Animals'] },
      { label: 'Plants', wikiCategories: ['Plants'] },
      { label: 'Medicine & Health', wikiCategories: ['Medicine', 'Health'] },
      { label: 'Genetics & Evolution', wikiCategories: ['Genetics', 'Evolutionary_biology'] },
      { label: 'Ecology & Environment', wikiCategories: ['Ecology', 'Environmental_science'] },
    ],
  },
  {
    id: 'geography',
    label: 'Geography',
    accent: '#8fa871',
    accentText: '#f2f6ec',
    watermark: 'globe',
    subcategories: [
      { label: 'Countries', wikiCategories: ['Countries'] },
      { label: 'Mountain Ranges, Peaks, & Landforms', wikiCategories: ['Mountain_ranges', 'Landforms'] },
      { label: 'Rivers, Lakes, & Waterways', wikiCategories: ['Rivers', 'Lakes'] },
      { label: 'Oceans & Seas', wikiCategories: ['Oceans', 'Seas'] },
      { label: 'Islands', wikiCategories: ['Islands'] },
      { label: 'World Cities, Towns, & Villages', wikiCategories: ['Cities', 'Capitals'] },
      { label: 'Exploration & Explorers', wikiCategories: ['Explorers', 'Exploration'] },
    ],
  },
  {
    id: 'history',
    label: 'History',
    accent: '#a0522d',
    accentText: '#f8efe8',
    watermark: 'column',
    subcategories: [
      { label: 'Ancient History', wikiCategories: ['Ancient_history'] },
      { label: 'Middle Ages', wikiCategories: ['Middle_Ages'] },
      { label: 'Modern History', wikiCategories: ['Modern_history'] },
      { label: 'Wars & Battles', wikiCategories: ['Wars', 'Battles'] },
      { label: 'Historical Figures', wikiCategories: ['Heads_of_state', 'Revolutionaries'] },
      { label: 'United States History', wikiCategories: ['History_of_the_United_States'] },
    ],
  },
  {
    id: 'social',
    label: 'Social Science',
    accent: '#c9a227',
    accentText: '#2a2308',
    watermark: 'quill',
    subcategories: [
      { label: 'Sociology & Social Reform', wikiCategories: ['Sociology', 'Social_movements'] },
      { label: 'Anthropology', wikiCategories: ['Anthropology'] },
      { label: 'Archaeology', wikiCategories: ['Archaeology'] },
      { label: 'Economics', wikiCategories: ['Economics'] },
      { label: 'Political Science', wikiCategories: ['Political_science'] },
      { label: 'Psychology', wikiCategories: ['Psychology'] },
      { label: 'Law', wikiCategories: ['Law'] },
      { label: 'Calendar, Holidays, & Festivals', wikiCategories: ['Holidays', 'Festivals'] },
    ],
  },
  {
    id: 'religion',
    label: 'Religion & Philosophy',
    accent: '#6d5a8e',
    accentText: '#f1edf7',
    watermark: 'lamp',
    subcategories: [
      { label: 'World Religions', wikiCategories: ['Religions'] },
      { label: 'Mythology', wikiCategories: ['Mythology'] },
      { label: 'Philosophy & Philosophers', wikiCategories: ['Philosophy', 'Philosophers'] },
      { label: 'Sacred Texts', wikiCategories: ['Religious_texts'] },
    ],
  },
  {
    id: 'art',
    label: 'Art, Language, & Literature',
    accent: '#3f7f7f',
    accentText: '#ecf5f5',
    watermark: 'brush',
    subcategories: [
      { label: 'Painting & Sculpture', wikiCategories: ['Painting', 'Sculpture'] },
      { label: 'Architecture', wikiCategories: ['Architecture'] },
      { label: 'Literature & Writers', wikiCategories: ['Literature', 'Writers'] },
      { label: 'Language & Linguistics', wikiCategories: ['Linguistics', 'Languages'] },
      { label: 'Photography', wikiCategories: ['Photography'] },
    ],
  },
  {
    id: 'performing',
    label: 'Performing Arts',
    accent: '#a85c7a',
    accentText: '#f8eef3',
    watermark: 'mask',
    subcategories: [
      { label: 'Music & Composers', wikiCategories: ['Music', 'Composers'] },
      { label: 'Theater', wikiCategories: ['Theatre'] },
      { label: 'Dance', wikiCategories: ['Dance'] },
      { label: 'Film & Television', wikiCategories: ['Film', 'Television'] },
    ],
  },
  {
    id: 'sports',
    label: 'Sports, Hobbies, & Pets',
    accent: '#c87533',
    accentText: '#fbf1e8',
    watermark: 'ball',
    subcategories: [
      { label: 'Team Sports', wikiCategories: ['Team_sports'] },
      { label: 'Individual Sports', wikiCategories: ['Individual_sports'] },
      { label: 'Olympic Games', wikiCategories: ['Olympic_Games'] },
      { label: 'Games & Hobbies', wikiCategories: ['Hobbies', 'Games'] },
      { label: 'Pets', wikiCategories: ['Pets'] },
    ],
  },
]

export const areaById = (id: string | null | undefined): Area | undefined =>
  AREAS.find((a) => a.id === id)
