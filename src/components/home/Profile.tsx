'use client';

import { ComponentType, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    EnvelopeIcon,
    AcademicCapIcon,
    HeartIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Github, Linkedin } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { useMessages } from '@/lib/i18n/useMessages';
import { useLocaleStore } from '@/lib/stores/localeStore';

// Custom ORCID icon component
const OrcidIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
    </svg>
);

interface ProfileProps {
    author: SiteConfig['author'];
    social: SiteConfig['social'];
    features: SiteConfig['features'];
    researchInterests?: string[];
}

type IconComponent = ComponentType<{ className?: string }>;

interface SocialLink {
    name: string;
    href?: string;
    icon: IconComponent;
    tooltip: string;
    isLocation?: boolean;
    isDisabled?: boolean;
}

export default function Profile({ author, social, features, researchInterests }: ProfileProps) {
    const messages = useMessages();
    const locale = useLocaleStore((state) => state.locale);
    const isZh = locale.toLowerCase().startsWith('zh');
    const emailTooltip = social.email || messages.profile.email;
    const locationTooltip = isZh ? '江苏，苏州' : 'Jiangsu, China';
    const linkedinUnavailableTooltip = isZh ? '暂未开通' : 'Not available yet';
    const tooltipClassName = 'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-neutral-200/80 bg-white/90 px-2.5 py-1 text-center text-xs font-normal leading-none text-neutral-800 opacity-0 shadow-[0_8px_22px_rgba(15,23,42,0.16)] backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/15 dark:bg-neutral-950/90 dark:text-white dark:shadow-[0_8px_28px_rgba(0,0,0,0.5)]';

    const [hasLiked, setHasLiked] = useState(false);
    const [showThanks, setShowThanks] = useState(false);

    // Check local storage for user's like status
    useEffect(() => {
        if (!features.enable_likes) return;

        const userHasLiked = localStorage.getItem('chenlu-website-user-liked');
        if (userHasLiked === 'true') {
            setHasLiked(true);
        }
    }, [features.enable_likes]);

    const handleLike = () => {
        const newLikedState = !hasLiked;
        setHasLiked(newLikedState);

        if (newLikedState) {
            localStorage.setItem('chenlu-website-user-liked', 'true');
            setShowThanks(true);
            setTimeout(() => setShowThanks(false), 2000);
        } else {
            localStorage.removeItem('chenlu-website-user-liked');
            setShowThanks(false);
        }
    };

    const socialLinks: SocialLink[] = [
        ...(social.email ? [{
            name: messages.profile.email,
            href: `mailto:${social.email}`,
            icon: EnvelopeIcon,
            tooltip: emailTooltip,
        }] : []),
        ...(social.location || social.location_details ? [{
            name: messages.profile.location,
            href: social.location_url || 'https://www.google.com/maps/search/?api=1&query=Suzhou%2C%20China',
            icon: MapPinIcon,
            tooltip: locationTooltip,
            isLocation: true,
        }] : []),
        ...(social.google_scholar ? [{
            name: 'Google Scholar',
            href: social.google_scholar,
            icon: AcademicCapIcon,
            tooltip: 'Google Scholar',
        }] : []),
        ...(social.orcid ? [{
            name: 'ORCID',
            href: social.orcid,
            icon: OrcidIcon,
            tooltip: 'ORCID',
        }] : []),
        ...(social.github ? [{
            name: 'GitHub',
            href: social.github,
            icon: Github,
            tooltip: 'GitHub',
        }] : []),
        {
            name: 'LinkedIn',
            href: social.linkedin,
            icon: Linkedin,
            tooltip: social.linkedin ? 'LinkedIn' : linkedinUnavailableTooltip,
            isDisabled: !social.linkedin,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-8"
        >
            {/* Profile Image */}
            <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Image
                    src={author.avatar}
                    alt={author.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover object-[32%_center]"
                    priority
                />
            </div>

            {/* Name and Title */}
            <div className="w-64 mx-auto text-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                    {author.name}
                </h1>
                <p className="text-lg text-accent font-medium mb-1">
                    {author.title}
                </p>
                <p className="text-neutral-600 mb-2">
                    {author.institution}
                </p>
            </div>

            {/* Contact Links */}
            <div className="w-64 mx-auto flex flex-wrap items-center justify-between gap-y-2 mb-6 relative">
                {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    const commonClassName = `group relative p-2 sm:p-2 text-neutral-600 dark:text-neutral-400 transition-colors duration-200 ${link.isDisabled
                        ? 'cursor-help hover:text-neutral-700 dark:hover:text-neutral-300'
                        : 'hover:text-accent'
                        }`;

                    if (link.isDisabled) {
                        return (
                            <button
                                key={link.name}
                                type="button"
                                className={commonClassName}
                                aria-label={`${link.name}: ${link.tooltip}`}
                                aria-disabled="true"
                            >
                                <IconComponent className="h-5 w-5" />
                                <span className={tooltipClassName} role="tooltip">
                                    {link.tooltip}
                                </span>
                            </button>
                        );
                    }

                    const opensInNewTab = Boolean(link.isLocation || (!link.href?.startsWith('mailto:')));
                    return (
                        <a
                            key={link.name}
                            href={link.href}
                            target={opensInNewTab ? '_blank' : undefined}
                            rel={opensInNewTab ? 'noopener noreferrer' : undefined}
                            className={commonClassName}
                            aria-label={`${link.name}: ${link.tooltip}`}
                        >
                            <IconComponent className="h-5 w-5" />
                            <span className={tooltipClassName} role="tooltip">
                                {link.tooltip}
                            </span>
                        </a>
                    );
                })}
            </div>

            {/* Research Interests */}
            {researchInterests && researchInterests.length > 0 && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-6 text-center hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <h3 className="font-semibold text-primary mb-3">{messages.profile.researchInterests}</h3>
                    <div className="space-y-2 text-[0.86rem] leading-relaxed text-neutral-700 dark:text-neutral-500">
                        {researchInterests.map((interest, index) => (
                            <div key={index}>{interest}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Like Button */}
            {features.enable_likes && (
                <div className="w-64 mx-auto flex justify-center">
                    <div className="relative">
                        <motion.button
                            onClick={handleLike}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${hasLiked
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer'
                                }`}
                        >
                            {hasLiked ? (
                                <HeartSolidIcon className="h-4 w-4" />
                            ) : (
                                <HeartIcon className="h-4 w-4" />
                            )}
                            <span>{hasLiked ? messages.profile.liked : messages.profile.like}</span>
                        </motion.button>

                        {/* Thanks bubble */}
                        <AnimatePresence>
                            {showThanks && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -10, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap"
                                >
                                    {messages.profile.thanks} 😊
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
