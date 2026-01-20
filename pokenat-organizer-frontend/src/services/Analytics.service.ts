// Service pour centraliser le tracking Matomo

declare global {
    interface Window {
        _paq?: Array<(string | number | boolean)[]>;
    }
}

class AnalyticsService {
    private track(...args: (string | number | boolean)[]) {
        window._paq?.push(args);
    }

    trackEvent(category: string, action: string, name?: string, value?: number) {
        if (name !== undefined && value !== undefined) {
            this.track('trackEvent', category, action, name, value);
        } else if (name !== undefined) {
            this.track('trackEvent', category, action, name);
        } else {
            this.track('trackEvent', category, action);
        }
    }

    trackSearch(keyword: string, category?: string, resultsCount?: number) {
        this.track('trackSiteSearch', keyword, category || '', resultsCount || 0);
    }

    // Événements spécifiques à l'application
    trackPokedexSelect(pokedexName: string) {
        this.trackEvent('Pokedex', 'select', pokedexName);
    }

    trackLanguageChange(lang: string) {
        this.trackEvent('Settings', 'language', lang);
    }

    trackPokemonView(pokemonName: string, pokemonId: number) {
        this.trackEvent('Pokemon', 'view', pokemonName, pokemonId);
    }

    trackPokemonSearch(query: string, resultsCount: number) {
        this.trackSearch(query, 'pokemon', resultsCount);
    }

    trackEncountersOpen(pokemonName: string) {
        this.trackEvent('Pokemon', 'encounters_open', pokemonName);
    }
}

export default new AnalyticsService();
