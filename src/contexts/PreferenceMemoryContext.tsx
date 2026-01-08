/**
 * Preference Memory Context - BACKWARD COMPATIBLE RE-EXPORT
 *
 * This file re-exports everything from the new modular structure
 * to maintain backward compatibility with existing imports.
 *
 * New code should import directly from '@/contexts/preferences'
 *
 * @deprecated Import from '@/contexts/preferences' instead
 */

// ============================================================================
// ALL EXPORTS FROM NEW MODULAR STRUCTURE
// ============================================================================

export * from './preferences';

// ============================================================================
// PROVIDER ALIAS (for backward compatibility)
// ============================================================================

export { PreferenceProvider as PreferenceMemoryProvider } from './preferences';
