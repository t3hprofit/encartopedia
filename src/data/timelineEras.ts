// The Timeline band: 15,000,000 BC → today, curated the way Encarta curated
// its horizontally scrolling illustrated history. Items link to live articles.

export interface TimelineItem {
  year: number // negative = BC
  label: string
  article: string
}

export interface TimelineEra {
  id: string
  label: string
  span: string
  color: string
  items: TimelineItem[]
}

export const ERAS: TimelineEra[] = [
  {
    id: 'prehistory',
    label: 'Prehistory',
    span: '15,000,000 BC – 3500 BC',
    color: '#8a7a5c',
    items: [
      { year: -15000000, label: 'Early apes roam the Miocene', article: 'Miocene' },
      { year: -3300000, label: 'First stone tools', article: 'Oldowan' },
      { year: -300000, label: 'Homo sapiens appears', article: 'Early modern human' },
      { year: -40000, label: 'Cave painting begins', article: 'Cave painting' },
      { year: -10000, label: 'Agriculture takes root', article: 'Neolithic Revolution' },
      { year: -4000, label: 'Woolly mammoths dwindle', article: 'Woolly mammoth' },
    ],
  },
  {
    id: 'ancient',
    label: 'Ancient World',
    span: '3500 BC – 476 AD',
    color: '#a0522d',
    items: [
      { year: -3200, label: 'Writing invented in Sumer', article: 'Cuneiform' },
      { year: -2560, label: 'Great Pyramid completed', article: 'Great Pyramid of Giza' },
      { year: -776, label: 'First Olympic games', article: 'Ancient Olympic Games' },
      { year: -508, label: 'Athenian democracy', article: 'Athenian democracy' },
      { year: -221, label: 'Qin unifies China', article: 'Qin Shi Huang' },
      { year: -44, label: 'Caesar assassinated', article: 'Assassination of Julius Caesar' },
      { year: 476, label: 'Fall of Rome', article: 'Fall of the Western Roman Empire' },
    ],
  },
  {
    id: 'medieval',
    label: 'Middle Ages',
    span: '477 – 1453',
    color: '#6d5a8e',
    items: [
      { year: 622, label: 'The Hijra', article: 'Hegira' },
      { year: 800, label: 'Charlemagne crowned', article: 'Charlemagne' },
      { year: 1066, label: 'Battle of Hastings', article: 'Battle of Hastings' },
      { year: 1206, label: 'Genghis Khan unites the Mongols', article: 'Genghis Khan' },
      { year: 1347, label: 'The Black Death', article: 'Black Death' },
      { year: 1453, label: 'Constantinople falls', article: 'Fall of Constantinople' },
    ],
  },
  {
    id: 'renaissance',
    label: 'Renaissance & Discovery',
    span: '1454 – 1700',
    color: '#3f7f7f',
    items: [
      { year: 1455, label: 'Gutenberg prints the Bible', article: 'Gutenberg Bible' },
      { year: 1492, label: 'Columbus crosses the Atlantic', article: 'Voyages_of_Christopher_Columbus' },
      { year: 1503, label: 'Mona Lisa painted', article: 'Mona Lisa' },
      { year: 1543, label: 'Copernicus moves the Earth', article: 'Nicolaus Copernicus' },
      { year: 1609, label: 'Galileo raises a telescope', article: 'Galileo Galilei' },
      { year: 1687, label: 'Newton publishes the Principia', article: 'Philosophiæ Naturalis Principia Mathematica' },
    ],
  },
  {
    id: 'enlightenment',
    label: 'Revolutions',
    span: '1701 – 1850',
    color: '#c9a227',
    items: [
      { year: 1776, label: 'American independence', article: 'United States Declaration of Independence' },
      { year: 1789, label: 'French Revolution', article: 'French Revolution' },
      { year: 1804, label: 'Napoleon crowns himself', article: 'Napoleon' },
      { year: 1825, label: 'First passenger railway', article: 'Stockton and Darlington Railway' },
      { year: 1837, label: 'Telegraph patented', article: 'Electrical telegraph' },
    ],
  },
  {
    id: 'industrial',
    label: 'Industry & Empire',
    span: '1851 – 1913',
    color: '#5b7fa6',
    items: [
      { year: 1859, label: 'On the Origin of Species', article: 'On the Origin of Species' },
      { year: 1876, label: 'The telephone speaks', article: 'Alexander Graham Bell' },
      { year: 1879, label: 'Electric light glows', article: 'Incandescent light bulb' },
      { year: 1889, label: 'Eiffel Tower rises', article: 'Eiffel Tower' },
      { year: 1903, label: 'First powered flight', article: 'Wright Flyer' },
    ],
  },
  {
    id: 'twentieth',
    label: 'The World Wars',
    span: '1914 – 1945',
    color: '#8f1a1a',
    items: [
      { year: 1914, label: 'The Great War begins', article: 'World War I' },
      { year: 1928, label: 'Penicillin discovered', article: 'Penicillin' },
      { year: 1929, label: 'The Crash', article: 'Wall Street crash of 1929' },
      { year: 1939, label: 'World War II begins', article: 'World War II' },
      { year: 1945, label: 'The atomic age opens', article: 'Atomic bombings of Hiroshima and Nagasaki' },
    ],
  },
  {
    id: 'space',
    label: 'The Space Age',
    span: '1946 – 1991',
    color: '#45452c',
    items: [
      { year: 1947, label: 'The transistor', article: 'Transistor' },
      { year: 1957, label: 'Sputnik beeps', article: 'Sputnik 1' },
      { year: 1969, label: 'A man on the Moon', article: 'Apollo 11' },
      { year: 1981, label: 'Space Shuttle launches', article: 'Space Shuttle Columbia' },
      { year: 1989, label: 'The Berlin Wall falls', article: 'Fall of the Berlin Wall' },
      { year: 1991, label: 'The Web goes public', article: 'World Wide Web' },
    ],
  },
  {
    id: 'information',
    label: 'The Information Age',
    span: '1992 – today',
    color: '#2a5db0',
    items: [
      { year: 1994, label: 'A certain encyclopedia ships on CD-ROM', article: 'Encarta' },
      { year: 1997, label: 'A computer beats the champion', article: 'Deep Blue versus Garry Kasparov' },
      { year: 2001, label: 'Wikipedia begins', article: 'Wikipedia' },
      { year: 2007, label: 'The smartphone era', article: 'IPhone (1st generation)' },
      { year: 2012, label: 'Higgs boson observed', article: 'Higgs boson' },
      { year: 2022, label: 'Conversational AI arrives', article: 'ChatGPT' },
    ],
  },
]

export const formatTimelineYear = (y: number) =>
  y <= -10000
    ? `${Math.abs(y).toLocaleString()} BC`
    : y < 0
      ? `${Math.abs(y)} BC`
      : `AD ${y}`
