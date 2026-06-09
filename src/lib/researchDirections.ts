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
}

export interface ResearchDirection {
  id: string;
  title: string;
  titleLines: string[];
  description: string;
  publicationCount: string;
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

export const RESEARCH_DIRECTIONS: ResearchDirection[] = [
  {
    id: 'electrolytes-energy-storage',
    title: 'Electrolytes & Energy Storage',
    titleLines: ['Electrolytes &', 'Energy Storage'],
    description: '',
    publicationCount: '7 publications',
    keywords: [
      'Ion transport',
      'Solvation structures',
      'Polarizable force fields',
    ],
    papers: [
      {
        authors: 'Wang C, Wu Q.',
        venue: 'npj Computational Materials',
        year: '2026',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Han X, Wang C, et al.',
        venue: 'Advanced Materials',
        year: '2026',
        wangCorresponding: true,
        wangCoFirst: false,
      },
      {
        authors: 'Yang J, Li M, Fang S, Wang Y, ..., Wang C, et al.',
        venue: 'Science',
        year: '2024',
        wangCorresponding: false,
        wangCoFirst: false,
      },
    ],
    icon: BoltIcon,
    accent: {
      line: 'bg-amber-500/70',
      border: 'border-l-amber-500/60',
      icon: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      chip: 'border-amber-200/80 bg-amber-50/70 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
      hover: 'hover:border-amber-300/80 dark:hover:border-amber-500/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(245,158,11,0.16)] dark:hover:shadow-[0_16px_36px_rgba(251,191,36,0.10)]',
      link: 'text-[#d97706] hover:text-[#b45309] dark:text-amber-400 dark:hover:text-amber-300',
    },
    publicationIds: [
      'wangSystematicDrudebasedParameterization2026',
      'hanDiluteElectrolyteVehicular2026',
      'yangWaterinducedStrongIsotropic2024',
      'chenSupramolecularCrystalsBased2024',
      'songUnravelingSynergisticCoupling2022',
      'qinUnderstandingElectricFielddependent2021',
      'dingBoostingHoleTransport2020',
    ],
  },
  {
    id: 'molecular-ionic-liquids',
    title: 'Molecular & Ionic Liquids',
    titleLines: ['Molecular &', 'Ionic Liquids'],
    description: '',
    publicationCount: '10 publications',
    keywords: [
      'Liquid structures',
      'Molecular interactions',
      'Gas dissolution',
    ],
    papers: [
      {
        authors: 'Wang C, Wang Y, Gan Z, et al.',
        venue: 'Chemical Science',
        year: '2021',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Li K, Wang Y, Wang C, et al.',
        venue: 'Journal of the American Chemical Society',
        year: '2024',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Li B, Wang C, Zhang Y, Wang Y',
        venue: 'Green Energy & Environment',
        year: '2021',
        wangCorresponding: false,
        wangCoFirst: false,
      },
    ],
    icon: BeakerIcon,
    accent: {
      line: 'bg-green-600/65',
      border: 'border-l-green-700/55',
      icon: 'border-green-200 bg-green-50 text-green-800 dark:border-green-600/30 dark:bg-green-600/10 dark:text-green-300',
      chip: 'border-green-200/80 bg-green-50/70 text-green-900 dark:border-green-600/25 dark:bg-green-600/10 dark:text-green-300',
      hover: 'hover:border-green-300/75 dark:hover:border-green-600/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(22,101,52,0.13)] dark:hover:shadow-[0_16px_36px_rgba(74,222,128,0.08)]',
      link: 'text-[#16a34a] hover:text-[#15803d] dark:text-green-400 dark:hover:text-green-300',
    },
    publicationIds: [
      'wangTopologicalEngineeringTwodimensional2021',
      'liFluorineDomainsInduced2024',
      'pengMolecularlevelInsightCO22024',
      'lingRevisitingStructureInteraction2023',
      'dingElectronDensityLearning2023',
      'wangInsightsIonicLiquids2022',
      'liHighCO2Absorption2021',
      'liuThermodynamicalOriginNonmonotonic2021',
      'liuInsightsElectrochemicalDegradation2021',
      'liObservationLiquidliquidTransitions2022',
    ],
  },
  {
    id: 'interfaces-nanoconfinement',
    title: 'Interfaces & Nanoconfinement',
    titleLines: ['Interfaces &', 'Nanoconfinement'],
    description: '',
    publicationCount: '13 publications',
    keywords: [
      'Wetting behavior',
      'Membrane separation',
      'Responsive materials',
    ],
    papers: [
      {
        authors: 'Di A, Wang C, et al.',
        venue: 'Chemical Science',
        year: '2025',
        wangCorresponding: false,
        wangCoFirst: true,
      },
      {
        authors: 'Wang C, Liu G, Cao R, et al.',
        venue: 'Chemical Engineering Science',
        year: '2023',
        wangCorresponding: false,
        wangCoFirst: false,
      },
      {
        authors: 'Wang C, Wang Y, Liu J, et al.',
        venue: 'Chemical Engineering Journal',
        year: '2022',
        wangCorresponding: false,
        wangCoFirst: false,
      },
    ],
    icon: CubeTransparentIcon,
    accent: {
      line: 'bg-violet-500/65',
      border: 'border-l-violet-500/60',
      icon: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
      chip: 'border-violet-200/80 bg-violet-50/70 text-violet-800 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300',
      hover: 'hover:border-violet-300/75 dark:hover:border-violet-500/45',
      glow: 'hover:shadow-[0_16px_36px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_16px_36px_rgba(167,139,250,0.10)]',
      link: 'text-[#7c3aed] hover:text-[#6d28d9] dark:text-violet-400 dark:hover:text-violet-300',
    },
    publicationIds: [
      'diMXenebasedSolventresponsiveActuators2025',
      'wangRevealingWettingMechanism2023',
      'wangEntropyDrivingHighly2022',
      'wangMolecularInsightsAbnormal2020',
      'wangHeightdrivenStructureThermodynamic2019',
      'WangChenLuDiWeiNaMiShouXianChiZiYeTiDeYanJiuJinZhan2021',
      'zhangLamellarWaterInduced2024',
      'songStructureRegulationMOF2023',
      'wangTwodimensionalIonicLiquids2022',
      'wangAbnormalEnhancedFree2021',
      'wangTailoringMultipleSites2021',
      'wangMolecularInsightsRegulatable2019',
      'liuPreparationMWCNTsgraphenecelluloseFiber2019',
    ],
  },
];

const PUBLICATION_DIRECTION_BY_ID = new Map(
  RESEARCH_DIRECTIONS.flatMap((direction) =>
    direction.publicationIds.map((publicationId) => [publicationId, direction] as const)
  )
);

export function getResearchDirectionForPublication(publicationId: string): ResearchDirection | undefined {
  return PUBLICATION_DIRECTION_BY_ID.get(publicationId);
}
