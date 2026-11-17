import {
  BeakerIcon,
  BoltIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline';
import type {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
} from 'react';

export type ResearchDirectionIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'ref'> & {
    title?: string;
    titleId?: string;
  } & RefAttributes<SVGSVGElement>
>;

export interface ResearchDirectionPaper {
  authors: string;
  venue: string;
  year: string;
  wangCorresponding: boolean;
  wangCoFirst: boolean;
  coFirstAuthors?: string[];
}

export interface ResearchDirection {
  id: string;
  title: string;
  titleLines: string[];
  description: string;
  publicationCount: number;
  keywords: string[];
  papers: ResearchDirectionPaper[];
  icon: ResearchDirectionIcon;
  accent: {
    line: string;
    border: string;
    icon: string;
    chip: string;
    hover: string;
    glow: string;
    link: string;
  };
  publicationIds: string[];
}

export interface PublicationResearchTag {
  id: string;
  label: string;
  labelZh: string;
}

export const RESEARCH_DIRECTIONS: ResearchDirection[] = [
  {
    id: 'molecular-ionic-liquids',
    title: 'Gas Separation & Adsorption',
    titleLines: ['Gas Separation &', 'Adsorption'],
    description: '',
    publicationCount: 8,
    keywords: [
      'Gas dissolution',
      'Membrane separation',
      'Molecular adsorption',
    ],
    papers: [
      {
        authors: 'Wang C, Wang Y, Liu J, et al.',
        venue: 'Chem. Eng. J.',
        year: '2022',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Li K, Wang Y, Wang C, et al.',
        venue: 'J. Am. Chem. Soc.',
        year: '2024',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Song H, Peng Y, Wang C, et al.',
        venue: 'Angew. Chem. Int. Ed.',
        year: '2023',
        wangCorresponding: false,
        wangCoFirst: false,
      },
    ],
    icon: BeakerIcon,
    accent: {
      line: 'bg-green-600/65',
      border: 'border-l-green-700/55 dark:border-l-green-400/70',
      icon: 'border-green-200 bg-green-50 text-green-800 dark:border-green-600/30 dark:bg-green-600/10 dark:text-green-300',
      chip: 'border-green-200/80 bg-green-50/70 text-green-900 dark:border-green-600/25 dark:bg-green-600/10 dark:text-green-300',
      hover: 'hover:border-green-300/75 dark:hover:border-green-600/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(22,101,52,0.13)] dark:hover:shadow-[0_16px_36px_rgba(74,222,128,0.08)]',
      link: 'text-[#16a34a] hover:text-[#15803d] dark:text-green-400 dark:hover:text-green-300',
    },
    publicationIds: [
      'wangEntropyDrivingHighly2022',
      'wangTopologicalEngineeringTwodimensional2021',
      'liFluorineDomainsInduced2024',
      'songStructureRegulationMOF2023',
      'wangTwodimensionalIonicLiquids2022',
      'liHighCO2Absorption2021',
      'wangTailoringMultipleSites2021',
      'WangChenLuDiWeiNaMiShouXianChiZiYeTiDeYanJiuJinZhan2021',
    ],
  },
  {
    id: 'electrolytes-energy-storage',
    title: 'Electrolytes & Ion Transport',
    titleLines: ['Electrolytes &', 'Ion Transport'],
    description: '',
    publicationCount: 9,
    keywords: [
      'Solvation structures',
      'Ion transport',
      'Polarizable force fields',
    ],
    papers: [
      {
        authors: 'Wang Z, Liang K, Wang C, et al.',
        venue: 'Adv. Mater.',
        year: '2026',
        wangCorresponding: true,
        wangCoFirst: false,
      },
      {
        authors: 'Wang C, Wu Q.',
        venue: 'npj Comput. Mater.',
        year: '2026',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Han X, Wang C, et al.',
        venue: 'Adv. Mater.',
        year: '2026',
        wangCorresponding: true,
        wangCoFirst: false,
      },
    ],
    icon: BoltIcon,
    accent: {
      line: 'bg-amber-500/70',
      border: 'border-l-amber-500/60 dark:border-l-amber-400/75',
      icon: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      chip: 'border-amber-200/80 bg-amber-50/70 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
      hover: 'hover:border-amber-300/80 dark:hover:border-amber-500/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(245,158,11,0.16)] dark:hover:shadow-[0_16px_36px_rgba(251,191,36,0.10)]',
      link: 'text-[#d97706] hover:text-[#b45309] dark:text-amber-400 dark:hover:text-amber-300',
    },
    publicationIds: [
      'wangIonicLigandAssistedTransport2026',
      'wangSystematicDrudebasedParameterization2026',
      'hanDiluteElectrolyteVehicular2026',
      'xuTurningInsulatorsAccelerators2026',
      'chenSupramolecularCrystalsBased2024',
      'lingRevisitingStructureInteraction2023',
      'songUnravelingSynergisticCoupling2022',
      'qinUnderstandingElectricFielddependent2021',
      'wangAbnormalEnhancedFree2021',
    ],
  },
  {
    id: 'interfaces-nanoconfinement',
    title: 'Interfaces & Nanoconfined Transport',
    titleLines: ['Interfaces &', 'Nanoconfined Transport'],
    description: '',
    publicationCount: 20,
    keywords: [
      'Wetting behavior',
      'Nanoconfined transport',
      'Responsive materials',
    ],
    papers: [
      {
        authors: 'Di A, Wang C, et al.',
        venue: 'Chem. Sci.',
        year: '2025',
        wangCorresponding: false,
        wangCoFirst: true,
      },
      {
        authors: 'Wang C, Liu G, Cao R, et al.',
        venue: 'Chem. Eng. Sci.',
        year: '2023',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Yang J, Li M, Fang S, et al.',
        venue: 'Science',
        year: '2024',
        wangCorresponding: false,
        wangCoFirst: false,
      },
    ],
    icon: CubeTransparentIcon,
    accent: {
      line: 'bg-violet-500/65',
      border: 'border-l-violet-500/60 dark:border-l-violet-400/75',
      icon: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
      chip: 'border-violet-200/80 bg-violet-50/70 text-violet-800 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300',
      hover: 'hover:border-violet-300/75 dark:hover:border-violet-500/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_16px_36px_rgba(167,139,250,0.10)]',
      link: 'text-[#7c3aed] hover:text-[#6d28d9] dark:text-violet-400 dark:hover:text-violet-300',
    },
    publicationIds: [
      'diMXenebasedSolventresponsiveActuators2025',
      'wangRevealingWettingMechanism2023',
      'yangWaterinducedStrongIsotropic2024',
      'zhangLamellarWaterInduced2024',
      'pengMolecularlevelInsightCO22024',
      'songStructureRegulationMOF2023',
      'wangEntropyDrivingHighly2022',
      'wangTopologicalEngineeringTwodimensional2021',
      'wangTwodimensionalIonicLiquids2022',
      'wangMolecularInsightsAbnormal2020',
      'wangHeightdrivenStructureThermodynamic2019',
      'WangChenLuDiWeiNaMiShouXianChiZiYeTiDeYanJiuJinZhan2021',
      'wangAbnormalEnhancedFree2021',
      'qinUnderstandingElectricFielddependent2021',
      'xuTurningInsulatorsAccelerators2026',
      'liuThermodynamicalOriginNonmonotonic2021',
      'liuInsightsElectrochemicalDegradation2021',
      'wangMolecularInsightsRegulatable2019',
      'liuPreparationMWCNTsgraphenecelluloseFiber2019',
      'dingBoostingHoleTransport2020',
    ],
  },
];

const PUBLICATION_DIRECTIONS_BY_ID = new Map<string, ResearchDirection[]>();

for (const direction of RESEARCH_DIRECTIONS) {
  for (const publicationId of direction.publicationIds) {
    const directions = PUBLICATION_DIRECTIONS_BY_ID.get(publicationId) || [];
    directions.push(direction);
    PUBLICATION_DIRECTIONS_BY_ID.set(publicationId, directions);
  }
}

const PUBLICATION_RESEARCH_TAGS: PublicationResearchTag[] = [
  { id: 'ionic-liquids', label: 'Ionic Liquids', labelZh: '离子液体' },
  { id: 'molecular-simulation', label: 'Molecular Simulation', labelZh: '分子模拟' },
  { id: 'force-fields', label: 'Force Fields', labelZh: '力场' },
  { id: 'functional-materials', label: 'Functional Materials', labelZh: '功能材料' },
  { id: 'energy-storage', label: 'Energy Storage', labelZh: '储能' },
];

const PUBLICATION_RESEARCH_TAG_IDS: Record<string, string[]> = {
  wangIonicLigandAssistedTransport2026: ['ionic-liquids', 'functional-materials', 'energy-storage'],
  wangSystematicDrudebasedParameterization2026: ['molecular-simulation', 'force-fields', 'energy-storage'],
  hanDiluteElectrolyteVehicular2026: ['molecular-simulation', 'energy-storage'],
  xuTurningInsulatorsAccelerators2026: ['molecular-simulation', 'force-fields', 'energy-storage'],
  diMXenebasedSolventresponsiveActuators2025: ['ionic-liquids', 'functional-materials'],
  chenSupramolecularCrystalsBased2024: ['functional-materials', 'energy-storage'],
  liFluorineDomainsInduced2024: ['ionic-liquids', 'molecular-simulation'],
  pengMolecularlevelInsightCO22024: ['ionic-liquids', 'molecular-simulation'],
  yangWaterinducedStrongIsotropic2024: ['functional-materials', 'energy-storage'],
  zhangLamellarWaterInduced2024: ['molecular-simulation', 'functional-materials'],
  dingElectronDensityLearning2023: ['ionic-liquids', 'molecular-simulation'],
  songStructureRegulationMOF2023: ['molecular-simulation', 'functional-materials'],
  lingRevisitingStructureInteraction2023: ['ionic-liquids', 'molecular-simulation', 'force-fields', 'energy-storage'],
  wangRevealingWettingMechanism2023: ['ionic-liquids', 'molecular-simulation'],
  liObservationLiquidliquidTransitions2022: ['molecular-simulation'],
  wangEntropyDrivingHighly2022: ['ionic-liquids', 'molecular-simulation'],
  wangTwodimensionalIonicLiquids2022: ['ionic-liquids', 'molecular-simulation'],
  songUnravelingSynergisticCoupling2022: ['ionic-liquids', 'molecular-simulation', 'functional-materials', 'energy-storage'],
  wangInsightsIonicLiquids2022: ['ionic-liquids', 'molecular-simulation'],
  wangTopologicalEngineeringTwodimensional2021: ['ionic-liquids', 'molecular-simulation'],
  wangTailoringMultipleSites2021: ['molecular-simulation', 'functional-materials'],
  liuThermodynamicalOriginNonmonotonic2021: ['ionic-liquids', 'molecular-simulation'],
  wangAbnormalEnhancedFree2021: ['ionic-liquids', 'molecular-simulation', 'energy-storage'],
  qinUnderstandingElectricFielddependent2021: ['ionic-liquids', 'molecular-simulation', 'energy-storage'],
  liHighCO2Absorption2021: ['ionic-liquids', 'molecular-simulation'],
  liuInsightsElectrochemicalDegradation2021: ['ionic-liquids', 'molecular-simulation'],
  WangChenLuDiWeiNaMiShouXianChiZiYeTiDeYanJiuJinZhan2021: ['ionic-liquids', 'molecular-simulation'],
  wangMolecularInsightsAbnormal2020: ['ionic-liquids', 'molecular-simulation'],
  dingBoostingHoleTransport2020: ['ionic-liquids', 'molecular-simulation', 'functional-materials'],
  liuPreparationMWCNTsgraphenecelluloseFiber2019: ['ionic-liquids', 'functional-materials'],
  wangMolecularInsightsRegulatable2019: ['ionic-liquids', 'molecular-simulation'],
  wangHeightdrivenStructureThermodynamic2019: ['ionic-liquids', 'molecular-simulation'],
};

export function getResearchDirectionForPublication(publicationId: string): ResearchDirection | undefined {
  return getResearchDirectionsForPublication(publicationId)[0];
}

export function getResearchDirectionsForPublication(publicationId: string): ResearchDirection[] {
  return PUBLICATION_DIRECTIONS_BY_ID.get(publicationId) || [];
}

export function getResearchTagsForPublication(publicationId: string): PublicationResearchTag[] {
  const tagIds = new Set(PUBLICATION_RESEARCH_TAG_IDS[publicationId] || []);
  return PUBLICATION_RESEARCH_TAGS.filter((tag) => tagIds.has(tag.id));
}

export function getResearchDirectionById(directionId: string | null | undefined): ResearchDirection | undefined {
  if (!directionId) {
    return undefined;
  }

  return RESEARCH_DIRECTIONS.find((direction) => direction.id === directionId);
}
