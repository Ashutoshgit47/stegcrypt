import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
}

const BASE_URL = 'https://stegcrypt.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function PageSEO({
    title,
    description,
    path = '',
    image = DEFAULT_IMAGE
}: PageSEOProps) {
    const fullTitle = title === 'StegCrypt' ? title : `${title} | StegCrypt`;
    const url = `${BASE_URL}${path}`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="StegCrypt" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
