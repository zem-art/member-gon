import { useEffect } from "react";

const DEFAULT_TITLE = "BeliKilat — Fast Shopping, Best Prices ⚡";
const DEFAULT_DESCRIPTION =
    "Fast and trusted online shopping platform. Find quality products from various brands.";

interface PageMetaOptions {
    title?: string;
    description?: string;
}

/**
 * Update document.title and meta description dynamically per page.
 * On unmount, resets to defaults so navigating back restores the home title.
 */
export function usePageMeta({ title, description }: PageMetaOptions = {}) {
    useEffect(() => {
        // Title
        const prevTitle = document.title;
        if (title) {
            document.title = `${title} | BeliKilat`;
        }

        // Meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        const prevDesc = metaDesc?.getAttribute("content") || "";
        if (description && metaDesc) {
            metaDesc.setAttribute("content", description);
        }

        return () => {
            document.title = prevTitle || DEFAULT_TITLE;
            if (metaDesc) {
                metaDesc.setAttribute("content", prevDesc || DEFAULT_DESCRIPTION);
            }
        };
    }, [title, description]);
}
