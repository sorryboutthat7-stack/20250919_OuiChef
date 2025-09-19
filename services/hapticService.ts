import * as Haptics from 'expo-haptics';

/**
 * Centralized haptic feedback service for consistent user experience
 * Similar to Duolingo's approach with contextual, light feedback
 */
class HapticService {
  private static instance: HapticService;

  private constructor() {}

  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  /**
   * Light impact for button presses and successful actions
   * Use for: Save, Generate Recipe, Add Ingredient, etc.
   */
  lightImpact(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  /**
   * Medium impact for positive actions
   * Use for: Swipe right (save recipe), successful operations
   */
  mediumImpact(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  /**
   * Heavy impact for strong confirmations
   * Use for: Swipe complete, major state changes
   */
  heavyImpact(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  /**
   * Selection change haptic for toggles and filters
   * Use for: Filter changes, preference toggles
   */
  selectionChange(): void {
    Haptics.selectionAsync();
  }

  /**
   * Error/warning notification haptic
   * Use for: API failures, validation errors, empty states
   */
  errorNotification(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  /**
   * Success notification haptic
   * Use for: Successful operations, completion states
   */
  successNotification(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  /**
   * Warning notification haptic
   * Use for: Caution states, non-critical warnings
   */
  warningNotification(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  // Convenience methods for specific app contexts

  /**
   * Button press feedback - light impact for primary actions
   */
  buttonPress(): void {
    this.lightImpact();
  }

  /**
   * Swipe right (save recipe) - medium impact for positive action
   */
  swipeRight(): void {
    this.mediumImpact();
  }

  /**
   * Swipe left (dismiss recipe) - light impact for subtle feedback
   */
  swipeLeft(): void {
    this.lightImpact();
  }

  /**
   * Swipe complete - heavy impact for strong confirmation
   */
  swipeComplete(): void {
    this.heavyImpact();
  }

  /**
   * Ingredient chip creation - light impact for successful input
   */
  ingredientAdded(): void {
    this.lightImpact();
  }

  /**
   * Filter/preference change - selection haptic for toggle-like feedback
   */
  filterChanged(): void {
    this.selectionChange();
  }

  /**
   * Error state - error notification for failures
   */
  errorState(): void {
    this.errorNotification();
  }

  /**
   * Success state - success notification for completions
   */
  successState(): void {
    this.successNotification();
  }
}

export default HapticService.getInstance();
