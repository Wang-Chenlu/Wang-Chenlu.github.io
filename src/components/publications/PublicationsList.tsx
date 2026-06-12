'use client';

import { useState, useMemo, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
    CodeBracketIcon,
    DocumentTextIcon,
    SparklesIcon,
    UserGroupIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Publication, PublicationRole } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import { getResearchDirectionById, getResearchDirectionForPublication } from '@/lib/researchDirections';
import { useLocaleStore } from '@/lib/stores/localeStore';
import FormattedBibTeXText from './FormattedBibTeXText';
import PublicationAuthors from './PublicationAuthors';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
    directionFilterId?: string | null;
}

const PUBLICATIONS_SUMMARY_TEXT =
    'A complete list of my publications, including 8 papers as first, co-first, or corresponding author, 20 collaborative papers, 1 review article, and 1 preprint.';
const ZH_PUBLICATIONS_SUMMARY_TEXT =
    '完整论文列表，包括8篇第一作者、共同一作或通讯作者论文、20篇合作论文、1篇综述论文和1篇预印本。';

const ZH_DIRECTION_TITLES: Record<string, string> = {
    'electrolytes-energy-storage': '电解质与储能',
    'molecular-ionic-liquids': '水与离子液体',
    'interfaces-nanoconfinement': '界面与纳米限域',
};

const DIRECTION_NOTICE_TEXT_CLASSES: Record<string, string> = {
    'electrolytes-energy-storage': 'text-[#d97706] dark:text-amber-400',
    'molecular-ionic-liquids': 'text-[#16a34a] dark:text-green-400',
    'interfaces-nanoconfinement': 'text-[#7c3aed] dark:text-violet-400',
};

const DIRECTION_HIGHLIGHT_ACCENTS: Record<string, { text: string; dot: string }> = {
    'electrolytes-energy-storage': {
        text: 'text-[#d97706] dark:text-amber-400',
        dot: 'bg-[#d97706] dark:bg-amber-400',
    },
    'molecular-ionic-liquids': {
        text: 'text-[#16a34a] dark:text-green-400',
        dot: 'bg-[#16a34a] dark:bg-green-400',
    },
    'interfaces-nanoconfinement': {
        text: 'text-[#7c3aed] dark:text-violet-400',
        dot: 'bg-[#7c3aed] dark:bg-violet-400',
    },
};

const ZH_PUBLICATION_TYPE_LABELS: Record<string, string> = {
    journal: '期刊论文',
    preprint: '预印本',
    conference: '会议论文',
    book: '图书',
    chapter: '章节',
    thesis: '学位论文',
};

interface PublicationHighlight {
    highlights: string[];
    codeHref?: string;
}

const PUBLICATION_HIGHLIGHTS: Record<string, PublicationHighlight> = {
    chenSupramolecularCrystalsBased2024: {
        highlights: [
            'Develops Zn-based supramolecular crystals, Zn(TFSI)₂SN₃, with ordered three-dimensional tunnels for Zn²⁺ conduction.',
            'Achieves high ionic conductivity from 25 to -35 °C and a Zn²⁺ transference number of 0.97.',
            'Enables dendrite-free Zn plating/stripping and durable solid-state Zn batteries over 70,000 cycles.',
        ],
    },
    hanDiluteElectrolyteVehicular2026: {
        highlights: [
            'Proposes a dilute electrolyte with vehicular aggregates to combine AGG-dominated Li⁺ solvation with 4.9 mS cm⁻¹ ionic conductivity.',
            'Uses sterically hindered PSF solvent to form robust LiF/Li₂O-rich interphases and ≈99.5% Li-metal Coulombic efficiency.',
            'Enables 4.6 V lithium-metal batteries with ultra-high-Ni cathodes, strong rate capability, and 87% capacity retention after 150 cycles.',
        ],
    },
    diMXenebasedSolventresponsiveActuators2025: {
        highlights: [
            'Constructs MXene-based bilayer actuators with polymer-intercalated gradient active layers for solvent-vapor response.',
            'Combines scattering, DFT, and molecular dynamics to connect gradient intercalation with counterintuitive bending behavior.',
            'Demonstrates fast, remotely light-controllable actuation for sensing, smart switching, and adaptive material applications.',
        ],
    },
    dingElectronDensityLearning2023: {
        highlights: [
            'Trains a machine-learning model to predict Z-bond electron density (rho_BCP) in ionic-liquid systems beyond single DFT or MD calculations.',
            'Connects Z-bond energy with electrochemical potential windows in ILs@TiO2 and charge-carrier mobility in PEDOT-ILs@SiO2.',
            'Provides an efficient route for relating local Z-bond networks to electrochemical properties in nanoscale ionic-liquid systems.',
        ],
    },
    liFluorineDomainsInduced2024: {
        highlights: [
            'Reveals fluorine-domain-driven ultrahigh N₂ solubility in fluorinated ionic liquids through molecular simulations.',
            '[Emim]FAP reaches 4.844 × 10⁻³ N₂ solubility, about 118 times higher than traditional [Emim]NO₃.',
            'Introduces fluorine densification energy to connect C–F bond density, free volume, and N₂-anion dissociation.',
        ],
    },
    liHighCO2Absorption2021: {
        highlights: [
            'Uses molecular dynamics to clarify how metal-based ionic liquids enhance CO₂ absorption and diffusion simultaneously.',
            'Identifies sparse CO₂-MBIL hydrogen-bond networks through radial distribution functions and CO₂-ion interaction energies.',
            'Links short metal-Cl bond lengths and small anion volumes to higher CO₂ absorption in Bmim[XClₙ]ₘ systems.',
        ],
    },
    liuInsightsElectrochemicalDegradation2021: {
        highlights: [
            'Clarifies direct and indirect electrochemical cleavage routes for lignin Caryl-O bonds in a protic IL-H₂O electrolyte.',
            'Shows O₂ enables indirect oxidation through in situ generated H₂O₂, while N₂ favors direct substrate oxidation on RuO₂-IrO₂/Ti.',
            'Combines cyclic voltammetry, degradation-product analysis, and isotope-labeling experiments to resolve the C-O cleavage mechanism.',
        ],
    },
    lingRevisitingStructureInteraction2023: {
        highlights: [
            'Builds a deep-learning force field (DPFF) for 10 ionic liquids from ab initio molecular dynamics data.',
            'Validates DPFF against force, energy, bond, angle, potential-energy, and vibrational-spectrum references.',
            'Extends ns-long MD simulations to bulk IL systems and captures coupled Coulombic and hydrogen-bond interactions.',
        ],
    },
    liObservationLiquidliquidTransitions2022: {
        highlights: [
            'Combines diamond anvil cell technology with 2D-IR spectroscopy to track hydrogen-bond fluctuation dynamics in water at 23 °C.',
            'Observes abrupt pressure-induced LLT behavior in the hydrogen-bond network under ambient-temperature, high-pressure conditions.',
            'Attributes the rapid onset to collapse of linear hydrogen bonds within tetrahedral water configurations, clarifying dynamics in "no-man\'s land".',
        ],
    },
    songUnravelingSynergisticCoupling2022: {
        highlights: [
            'Builds an "Ionogel-in-Ceramic" HSE using LATP particles as the ceramic framework and PolyIL-in-Salt ionogel as the ionic bridge.',
            'Uses molecular dynamics to reveal salt-concentration-dependent co-coordination that creates efficient interparticle Li⁺ pathways.',
            'Achieves 0.17 mS cm⁻¹ ionic conductivity at 50 °C and over 3500 h cycling in Li/Li symmetric cells.',
        ],
    },
    wangEntropyDrivingHighly2022: {
        highlights: [
            'Reveals entropy-driven CO₂/CH₄ separation in nanoconfined ionic liquids inside graphene oxide membranes.',
            'Shows selectivity increases from 25.01 to 149.20 as the interlayer distance decreases from 3.00 to 1.50 nm.',
            'Connects confined-IL structural rearrangement, CO₂ adsorption sites, and configurational entropy to high CO₂ selectivity.',
        ],
    },
    wangInsightsIonicLiquids2022: {
        highlights: [
            'Reviews ionic-liquid behavior from Z-bonds to quasi-liquids across multiscale simulations and experimental characterization.',
            'Frames electrostatic-force and hydrogen-bond coupling as the origin of Z-bond networks in ionic liquids.',
            'Connects quasi-liquid interfacial ordering to applications in CO₂ capture, biomass conversion, and energy-storage materials.',
        ],
    },
    wangTwodimensionalIonicLiquids2022: {
        highlights: [
            'Quantifies the thinnest possible IL films as ordered two-dimensional mono-ionic liquid structures.',
            'Identifies anomalous stepwise melting through localized rotated, out-of-plane flipped, and fully disordered states.',
            'Demonstrates ultrahigh CO₂ adsorption capability and structural robustness during CO₂ adsorption-desorption cycling.',
        ],
    },
    pengMolecularlevelInsightCO22024: {
        highlights: [
            'Reveals how a triazole ionic-liquid interfacial microhabitat regulates CO₂ electroreduction to formate.',
            'Links [124Triz]⁻-CO₂ dipolar interactions and persistent [124Triz]⁻-H₂O hydrogen bonding to interfacial proton organization.',
            'Shows [124Triz]⁻ lowers the *HCOO formation free energy to −0.10 eV, compared with 0.43 eV for [NTf₂]⁻.',
        ],
    },
    yangWaterinducedStrongIsotropic2024: {
        highlights: [
            'Uses nanoconfined water to align graphene and Ti₃C₂Tₓ MXene nanoplatelets into free-standing isotropic sheets at room temperature.',
            'Combines covalent and π–π interplatelet bridging to reach 1.87 GPa tensile strength and 98.7 GPa modulus.',
            'Achieves 1423 S cm⁻¹ electrical conductivity and 828 C cm⁻³ volumetric specific capacity for flexible energy-storage electrodes.',
        ],
    },
    zhangLamellarWaterInduced2024: {
        highlights: [
            'Reveals quantized interlayer spacing states in nanochannel walls under sub-1.4 nm water confinement.',
            'Attributes the discrete stable spacings to monolayer, bilayer, and trilayer lamellar water configurations.',
            'Connects confined-water counterforce and surface wettability to the design of ion filtration membranes and artificial channels.',
        ],
    },
    songStructureRegulationMOF2023: {
        highlights: [
            'Regulates Zn₂(benzimidazolate)₄ MOF nanosheet membranes with low-dose amino side groups and CO₂ bridge linkers.',
            'Combines CO₂ adsorption-assisted molecular sieving with steric hindrance while preserving fast H₂ transport apertures.',
            'Achieves an H₂/CO₂ mixture separation factor of 1158 and H₂ permeance of 1417 GPU in ultrathin nanosheet membranes.',
        ],
    },
    wangRevealingWettingMechanism2023: {
        highlights: [
            'Reveals how Li⁺ doping reshapes IL orientation and weakens IL-substrate interactions on TiO₂-B(100).',
            'Shows Li⁺ concentration increases the contact angle from 86.97° to 131.18°, driving a hydrophilic-to-hydrophobic transition.',
            'Identifies the dense adjacent interfacial layer from strong Li⁺ adsorption as the dominant wetting-control mechanism.',
        ],
    },
    wangSystematicDrudebasedParameterization2026: {
        highlights: [
            'Establishes a transferable Drude-oscillator parameterization workflow and OPLS&Pol for battery electrolyte simulations.',
            'Captures many-body polarization to reproduce complex ion solvation motifs across neat and multicomponent electrolytes.',
            'Achieves R²global = 0.94 and high throughput while revealing solvation reorganization, coordination competition, and ion aggregation.',
        ],
    },
};

type RoleFilter = PublicationRole | 'all';

export default function PublicationsList({
    config,
    publications,
    embedded = false,
    directionFilterId,
}: PublicationsListProps) {
    const messages = useMessages();
    const locale = useLocaleStore((state) => state.locale);
    const isChinese = locale.startsWith('zh');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractIds, setExpandedAbstractIds] = useState<Set<string>>(new Set());
    const [figureIndexes, setFigureIndexes] = useState<Record<string, number>>({});
    const activeDirection = useMemo(
        () => getResearchDirectionById(directionFilterId),
        [directionFilterId]
    );
    const directionFilteredPublications = useMemo(() => {
        if (!activeDirection) {
            return publications;
        }

        const publicationIds = new Set(activeDirection.publicationIds);
        return publications.filter((publication) => publicationIds.has(publication.id));
    }, [activeDirection, publications]);
    const hasPublications = directionFilteredPublications.length > 0;

    useEffect(() => {
        setSearchQuery('');
        setSelectedYear('all');
        setSelectedType('all');
        setSelectedRole('all');
    }, [activeDirection?.id]);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(directionFilteredPublications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [directionFilteredPublications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(directionFilteredPublications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [directionFilteredPublications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return directionFilteredPublications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;
            const matchesRole = selectedRole === 'all' || pub.role === selectedRole;

            return matchesSearch && matchesYear && matchesType && matchesRole;
        });
    }, [directionFilteredPublications, searchQuery, selectedYear, selectedType, selectedRole]);

    const toggleRoleFilter = (role: PublicationRole) => {
        setSelectedRole((currentRole) => currentRole === role ? 'all' : role);
    };

    const toggleAbstract = (publicationId: string) => {
        setExpandedAbstractIds((current) => {
            const next = new Set(current);
            if (next.has(publicationId)) {
                next.delete(publicationId);
            } else {
                next.add(publicationId);
            }
            return next;
        });
    };

    const shiftFigure = (publicationId: string, figureCount: number, direction: -1 | 1) => {
        if (figureCount <= 1) {
            return;
        }

        setFigureIndexes((current) => {
            const currentIndex = current[publicationId] || 0;
            const nextIndex = (currentIndex + direction + figureCount) % figureCount;
            return { ...current, [publicationId]: nextIndex };
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} leading-relaxed text-neutral-600 dark:text-neutral-500 max-w-3xl`}>
                        {activeDirection ? (
                            <DirectionFilterNotice
                                directionId={activeDirection.id}
                                title={activeDirection.title}
                                count={directionFilteredPublications.length}
                                accentClassName={activeDirection.accent.link}
                                isChinese={isChinese}
                            />
                        ) : (config.description === PUBLICATIONS_SUMMARY_TEXT || config.description === ZH_PUBLICATIONS_SUMMARY_TEXT) ? (
                            <PublicationsSummary
                                selectedRole={selectedRole}
                                onRoleClick={toggleRoleFilter}
                                isChinese={isChinese}
                            />
                        ) : (
                            config.description
                        )}
                    </div>
                )}
            </div>

            {/* Search and Filter Controls */}
            {hasPublications && (
            <div className="mb-8 space-y-4">
                {/* ... (keep existing controls) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {formatPublicationTypeLabel(type, isChinese)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            )}

            {/* Publications Grid */}
            <div className="space-y-6">
                {!hasPublications ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.empty}
                    </div>
                ) : filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => {
                        const direction = getResearchDirectionForPublication(pub.id);
                        const DirectionIcon = direction?.icon;
                        const figures = getPublicationFigures(pub);
                        const highlight = PUBLICATION_HIGHLIGHTS[pub.id];
                        const mediaFigures = getPublicationMediaFigures(pub.toc, figures);
                        const figureIndex = mediaFigures.length > 0
                            ? Math.min(figureIndexes[pub.id] || 0, mediaFigures.length - 1)
                            : 0;

                        return (
                        <motion.div
                            key={pub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className={cn(
                                "font-en-body relative overflow-hidden rounded-xl border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.055)] transition-all duration-200 dark:bg-neutral-900 dark:shadow-[0_14px_34px_rgba(2,6,23,0.32)] dark:ring-1 dark:ring-slate-700/50",
                                direction
                                    ? `border-neutral-200 border-l-4 dark:border-slate-600/70 ${direction.accent.border} ${direction.accent.hover} ${direction.accent.glow}`
                                    : "border-neutral-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-600/70 dark:hover:border-slate-500"
                            )}
                        >
                            <div className="mb-2 flex items-start gap-3">
                                <h3 className={`${embedded ? "text-lg" : "text-xl"} min-w-0 flex-1 font-semibold text-primary leading-tight`}>
                                    <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                                </h3>
                                {direction && DirectionIcon && (
                                    <span
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${direction.accent.icon}`}
                                        title={direction.title}
                                    >
                                        <DirectionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                            <PublicationAuthors
                                authors={pub.authors}
                                className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-slate-300 mb-2`}
                            />
                            <p className="text-sm text-neutral-800 dark:text-slate-200 mb-3">
                                <PublicationVenue pub={pub} />
                            </p>

                            {pub.description && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                                    {pub.description}
                                </p>
                            )}

                            {highlight && (
                                <PublicationHighlightPanel
                                    highlight={highlight}
                                    publication={pub}
                                    figures={mediaFigures}
                                    currentIndex={figureIndex}
                                    onPrevious={() => shiftFigure(pub.id, mediaFigures.length, -1)}
                                    onNext={() => shiftFigure(pub.id, mediaFigures.length, 1)}
                                    isChinese={isChinese}
                                    directionId={direction?.id}
                                />
                            )}

                            <div className="flex flex-wrap gap-2">
                                {pub.doi && (
                                    <PublicationLink
                                        href={getDoiHref(pub.doi)}
                                        label={isChinese ? '查阅论文' : 'View Paper'}
                                        icon={<ArrowTopRightOnSquareIcon className="h-3 w-3" />}
                                    />
                                )}
                                {pub.html && (
                                    <PublicationLink href={pub.html} label="HTML" />
                                )}
                                {pub.url && (
                                    <PublicationLink href={pub.url} label="URL" />
                                )}
                                {pub.pdfUrl && (
                                    <PublicationLink href={pub.pdfUrl} label="PDF" />
                                )}
                                {(pub.code || highlight) && (
                                    <PublicationCodeDataButton
                                        href={pub.code || highlight?.codeHref}
                                        isChinese={isChinese}
                                    />
                                )}
                                {pub.slides && (
                                    <PublicationLink href={pub.slides} label="Slides" />
                                )}
                                {pub.video && (
                                    <PublicationLink href={pub.video} label="Video" />
                                )}
                                {pub.arxivId && (
                                    <PublicationLink href={getArxivHref(pub.arxivId)} label="arXiv" />
                                )}
                                {pub.abstract && (
                                    <button
                                        onClick={() => toggleAbstract(pub.id)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                            expandedAbstractIds.has(pub.id)
                                                ? "bg-accent text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-slate-200 hover:bg-accent hover:text-white"
                                        )}
                                    >
                                        <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                        {expandedAbstractIds.has(pub.id)
                                            ? (isChinese ? '收起摘要' : 'Hide Abstract')
                                            : (isChinese ? '显示摘要' : 'Show Abstract')}
                                    </button>
                                )}
                                {pub.bibtex && (
                                    <button
                                        onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                            expandedBibtexId === pub.id
                                                ? "bg-accent text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-slate-200 hover:bg-accent hover:text-white"
                                        )}
                                    >
                                        <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                        {expandedBibtexId === pub.id
                                            ? (isChinese ? '收起引用格式' : `Hide ${messages.publications.bibtex}`)
                                            : (isChinese ? '显示引用格式' : `Show ${messages.publications.bibtex}`)}
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {expandedAbstractIds.has(pub.id) && pub.abstract ? (
                                    <motion.div
                                        key="abstract"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-slate-300">
                                            <ScientificText text={pub.abstract} />
                                        </p>
                                    </motion.div>
                                ) : null}
                                {expandedBibtexId === pub.id && pub.bibtex ? (
                                    <motion.div
                                        key="bibtex"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                            <pre className="text-xs text-neutral-600 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono">
                                                {pub.bibtex}
                                            </pre>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pub.bibtex || '');
                                                    // Optional: Show copied feedback
                                                }}
                                                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                                title={messages.common.copyToClipboard}
                                            >
                                                <ClipboardDocumentIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}

function PublicationHighlightPanel({
    highlight,
    publication,
    figures,
    currentIndex,
    onPrevious,
    onNext,
    isChinese,
    directionId,
}: {
    highlight: PublicationHighlight;
    publication: Publication;
    figures: string[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
    isChinese: boolean;
    directionId?: string;
}) {
    const accent = directionId ? DIRECTION_HIGHLIGHT_ACCENTS[directionId] : undefined;
    const accentText = accent?.text || 'text-[#d97706] dark:text-amber-400';
    const accentDot = accent?.dot || 'bg-[#d97706] dark:bg-amber-400';

    return (
        <section
            aria-label="Publication highlights and figures"
            className="mb-4 grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,1.18fr)] lg:items-start"
        >
            <div className="min-w-0 py-1">
                <div className={cn(
                    "font-semibold",
                    accentText,
                    isChinese ? "text-sm tracking-[0.04em]" : "text-xs uppercase tracking-[0.14em]"
                )}>
                    {isChinese ? '研究亮点' : 'Highlights'}
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {highlight.highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", accentDot)} aria-hidden="true" />
                            <span><ScientificText text={item} /></span>
                        </li>
                    ))}
                </ul>
            </div>
            {figures.length > 0 ? (
                <PublicationFigureCarousel
                    publication={publication}
                    figures={figures}
                    currentIndex={currentIndex}
                    onPrevious={onPrevious}
                    onNext={onNext}
                    isChinese={isChinese}
                />
            ) : null}
        </section>
    );
}

function DirectionFilterNotice({
    directionId,
    title,
    count,
    accentClassName,
    isChinese,
}: {
    directionId: string;
    title: string;
    count: number;
    accentClassName: string;
    isChinese: boolean;
}) {
    const localizedTitle = isChinese ? (ZH_DIRECTION_TITLES[directionId] || title) : title;
    const noticeClassName = DIRECTION_NOTICE_TEXT_CLASSES[directionId] || accentClassName;

    return (
        <div className="space-y-2">
            {isChinese ? (
                <p className={noticeClassName}>
                    <span className="font-semibold">{localizedTitle}</span>：
                    <span className="font-semibold">{count}</span> 篇。
                </p>
            ) : (
                <p className={noticeClassName}>
                    Showing <span className="font-semibold">{count}</span> related publications for{' '}
                    <span className="font-semibold">{localizedTitle}</span>.
                </p>
            )}
            <Link
                href="/publications/"
                className="inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-dark hover:underline dark:hover:text-accent-light"
            >
                {isChinese ? '查阅所有论文' : 'View All Publications'} &rarr;
            </Link>
        </div>
    );
}

function PublicationsSummary({
    selectedRole,
    onRoleClick,
    isChinese,
}: {
    selectedRole: RoleFilter;
    onRoleClick: (role: PublicationRole) => void;
    isChinese: boolean;
}) {
    return (
        <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
                <RoleSummaryButton
                    role="lead"
                    count="8"
                    label={isChinese ? '篇第一作者、共同一作或通讯作者论文' : 'papers as first, co-first, or corresponding author'}
                    icon={SparklesIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="collaborative"
                    count="20"
                    label={isChinese ? '篇合作论文' : 'collaborative papers'}
                    icon={UserGroupIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="review"
                    count="1"
                    label={isChinese ? '篇综述论文' : 'review article'}
                    icon={BookOpenIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
                <RoleSummaryButton
                    role="preprint"
                    count="1"
                    label={isChinese ? '篇预印本' : 'preprint'}
                    icon={DocumentTextIcon}
                    selectedRole={selectedRole}
                    onRoleClick={onRoleClick}
                />
            </div>
        </div>
    );
}

function formatPublicationTypeLabel(type: string, isChinese: boolean): string {
    if (isChinese) {
        return ZH_PUBLICATION_TYPE_LABELS[type] || type.replace('-', ' ');
    }

    return type.replace('-', ' ');
}

function RoleSummaryButton({
    role,
    count,
    label,
    icon: Icon,
    selectedRole,
    onRoleClick,
}: {
    role: PublicationRole;
    count: string;
    label: string;
    icon: typeof SparklesIcon;
    selectedRole: RoleFilter;
    onRoleClick: (role: PublicationRole) => void;
}) {
    const isActive = selectedRole === role;

    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={() => onRoleClick(role)}
            className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm leading-snug transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isActive
                    ? "border-accent/40 bg-accent/10 text-accent dark:border-accent/50 dark:bg-accent/15 dark:text-accent-light"
                    : "border-neutral-200 bg-neutral-50/70 text-neutral-700 hover:border-accent/40 hover:text-accent dark:border-slate-600/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-accent/50 dark:hover:text-accent-light"
            )}
        >
            <span
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white",
                    isActive
                        ? "border-accent/30 dark:border-accent/45 dark:bg-accent/10"
                        : "border-neutral-200 dark:border-slate-600/70 dark:bg-slate-800/80"
                )}
                aria-hidden="true"
            >
                <Icon className="h-4 w-4" />
            </span>
            <span>
                <span className="font-semibold">{count}</span>{' '}
                <span>{label}</span>
            </span>
        </button>
    );
}

function PublicationFigureCarousel({
    publication,
    figures,
    currentIndex,
    onPrevious,
    onNext,
    isChinese,
}: {
    publication: Publication;
    figures: string[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
    isChinese: boolean;
}) {
    const figure = figures[currentIndex];
    const hasMultipleFigures = figures.length > 1;
    const touchStartX = useRef<number | null>(null);

    const handleTouchEnd = (clientX: number) => {
        if (touchStartX.current === null || !hasMultipleFigures) {
            touchStartX.current = null;
            return;
        }

        const swipeDistance = clientX - touchStartX.current;
        if (Math.abs(swipeDistance) > 40) {
            if (swipeDistance > 0) {
                onPrevious();
            } else {
                onNext();
            }
        }
        touchStartX.current = null;
    };

    if (!figure) {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950"
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                    onPrevious();
                }
                if (event.key === 'ArrowRight') {
                    onNext();
                }
            }}
            onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
                handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
            }}
            tabIndex={0}
        >
            <div className="relative overflow-hidden rounded-md bg-neutral-50 dark:bg-neutral-900">
                <FigurePreview
                    figure={figure}
                    alt={isTocFigure(figure) ? `${publication.title} TOC graphic` : `${publication.title} figure ${currentIndex + 1}`}
                />

                {hasMultipleFigures && (
                    <>
                        <button
                            type="button"
                            onClick={onPrevious}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:border-accent hover:text-accent dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-slate-200"
                            title={isChinese ? '上一张图' : 'Previous figure'}
                            aria-label={isChinese ? '上一张图' : 'Previous figure'}
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:border-accent hover:text-accent dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-slate-200"
                            title={isChinese ? '下一张图' : 'Next figure'}
                            aria-label={isChinese ? '下一张图' : 'Next figure'}
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            <div className="mt-3 flex items-center justify-center text-xs font-semibold text-neutral-500 dark:text-slate-200">
                {currentIndex + 1}/{figures.length}
            </div>
        </div>
    );
}

function FigurePreview({ figure, alt }: { figure: string; alt: string }) {
    if (isPdfFigure(figure)) {
        return (
            <iframe
                key={figure}
                src={figure}
                title={alt}
                className="h-[min(70vh,720px)] min-h-[360px] w-full bg-white dark:bg-neutral-950"
            />
        );
    }

    return (
        <Image
            src={figure}
            alt={alt}
            width={1600}
            height={1019}
            className="mx-auto h-auto max-h-[720px] w-full object-contain"
            sizes="(max-width: 768px) 100vw, 960px"
        />
    );
}

function getPublicationFigures(publication: Publication): string[] {
    if (publication.figures && publication.figures.length > 0) {
        return publication.figures;
    }

    return publication.preview ? [publication.preview] : [];
}

function getPublicationMediaFigures(toc: string | undefined, figures: string[]): string[] {
    if (!toc) {
        return figures;
    }

    const normalizedToc = normalizePublicAssetPath(toc);
    const nonTocFigures = figures.filter((figure) => normalizePublicAssetPath(figure) !== normalizedToc);

    return [toc, ...nonTocFigures];
}

function normalizePublicAssetPath(pathValue: string): string {
    return pathValue.split(/[?#]/)[0]?.toLowerCase() || pathValue.toLowerCase();
}

function isPdfFigure(figure: string): boolean {
    return /\.pdf(?:$|[?#])/i.test(figure);
}

function isTocFigure(figure: string): boolean {
    return /(?:^|\/)toc\.(png|jpe?g|webp|gif|svg|pdf)(?:$|[?#])/i.test(figure);
}

function PublicationVenue({ pub }: { pub: Publication }) {
    const venue = pub.journal || pub.conference;
    const volumeIssue = pub.volume
        ? `${formatPublicationDetail(pub.volume)}${pub.issue ? `(${formatPublicationDetail(pub.issue)})` : ''}`
        : '';
    const pages = formatPublicationDetail(pub.pages);

    if (!venue) {
        return <>{pub.year}</>;
    }

    return (
        <>
            <span className="font-semibold italic">{venue}</span>
            {volumeIssue ? ` ${volumeIssue}` : ''}
            {pages ? `, ${pages}` : ''}
            {` (${pub.year}).`}
        </>
    );
}

function formatPublicationDetail(value?: string): string {
    return (value || '').replace(/---/g, '\u2014').replace(/--/g, '\u2013').trim();
}

function getDoiHref(doi: string): string {
    const cleanDoi = doi.trim().replace(/^doi:\s*/i, '');
    return /^https?:\/\//i.test(cleanDoi) ? cleanDoi : `https://doi.org/${cleanDoi}`;
}

function getArxivHref(arxivId: string): string {
    const cleanArxivId = arxivId.trim().replace(/^arxiv:\s*/i, '');
    return /^https?:\/\//i.test(cleanArxivId) ? cleanArxivId : `https://arxiv.org/abs/${cleanArxivId}`;
}

function PublicationLink({ href, label, icon }: { href: string; label: string; icon?: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-slate-200 hover:bg-accent hover:text-white transition-colors"
        >
            {icon ? (
                <span className="mr-1.5 inline-flex h-3 w-3 shrink-0 items-center justify-center" aria-hidden="true">
                    {icon}
                </span>
            ) : null}
            {label}
        </a>
    );
}

function PublicationCodeDataButton({ href, isChinese }: { href?: string; isChinese: boolean }) {
    const label = isChinese ? '查阅代码与数据' : 'View Code & Data';

    if (href) {
        return (
            <PublicationLink
                href={href}
                label={label}
                icon={<CodeBracketIcon className="h-3 w-3" />}
            />
        );
    }

    return (
        <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-slate-200"
        >
            <CodeBracketIcon className="mr-1.5 h-3 w-3" aria-hidden="true" />
            {label}
        </button>
    );
}

function ScientificText({ text }: { text: string }) {
    const parts = text.split(/(\$rho\$BCP|rho_BCP|rhoBCP|ρ_BCP|E_Z-bond|EZ-bond|Caryl-O|R²global|TiO2|SiO2|CO2|H2O|H2|N2|CH4|Li\+)/g);

    return (
        <>
            {parts.map((part, index) => {
                const key = `${part}-${index}`;

                if (part === 'R²global') {
                    return <R2Global key={key} />;
                }

                if (part === '$rho$BCP' || part === 'rho_BCP' || part === 'rhoBCP' || part === 'ρ_BCP') {
                    return <RhoBCP key={key} />;
                }

                if (part === 'E_Z-bond' || part === 'EZ-bond') {
                    return <EZBondEnergy key={key} />;
                }

                if (part === 'Caryl-O') {
                    return <CArylOBond key={key} />;
                }

                if (part === 'TiO2') {
                    return <ScientificNoWrap key={key}>TiO₂</ScientificNoWrap>;
                }

                if (part === 'SiO2') {
                    return <ScientificNoWrap key={key}>SiO₂</ScientificNoWrap>;
                }

                if (part === 'CO2') {
                    return <ScientificNoWrap key={key}>CO₂</ScientificNoWrap>;
                }

                if (part === 'H2O') {
                    return <ScientificNoWrap key={key}>H₂O</ScientificNoWrap>;
                }

                if (part === 'H2') {
                    return <ScientificNoWrap key={key}>H₂</ScientificNoWrap>;
                }

                if (part === 'N2') {
                    return <ScientificNoWrap key={key}>N₂</ScientificNoWrap>;
                }

                if (part === 'CH4') {
                    return <ScientificNoWrap key={key}>CH₄</ScientificNoWrap>;
                }

                if (part === 'Li+') {
                    return <ScientificNoWrap key={key}>Li⁺</ScientificNoWrap>;
                }

                return part;
            })}
        </>
    );
}

function EZBondEnergy() {
    return (
        <ScientificNoWrap>
            E<CompactSub>Z</CompactSub>-bond
        </ScientificNoWrap>
    );
}

function RhoBCP() {
    return (
        <ScientificNoWrap>
            ρ<CompactSub>BCP</CompactSub>
        </ScientificNoWrap>
    );
}

function R2Global() {
    return (
        <ScientificNoWrap>
            R²<CompactSub>global</CompactSub>
        </ScientificNoWrap>
    );
}

function CArylOBond() {
    return (
        <ScientificNoWrap>
            C<CompactSub>aryl</CompactSub>-O
        </ScientificNoWrap>
    );
}

function ScientificNoWrap({ children }: { children: ReactNode }) {
    return <span className="whitespace-nowrap">{children}</span>;
}

function CompactSub({ children }: { children: ReactNode }) {
    return <sub className="align-sub text-[0.72em] leading-none">{children}</sub>;
}
