export function getSubscriptionPlanLabel(...candidates: Array<unknown>): string {
    for (const candidate of candidates) {
        if (typeof candidate !== 'string') {
            continue;
        }

        const normalized = candidate.trim();
        if (!normalized) {
            continue;
        }

        const commercialName = normalizeCommercialPlanName(normalized);
        if (commercialName) {
            return commercialName;
        }

        return normalized;
    }

    return '-';
}

function normalizeCommercialPlanName(value: string): string | null {
    const key = value.trim().toLowerCase();
    const map: Record<string, string> = {
        basic: 'Professional',
        standard: 'Business',
        premium: 'Premium',
        enterprise: 'Enterprise',
        professional: 'Professional',
        business: 'Business'
    };

    return map[key] || null;
}
