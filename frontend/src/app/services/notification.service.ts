import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

export interface GameNotification {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentPeriod: string;
  gameClock: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private lastKnownScores = new Map<string, { home: number; away: number }>();
  private notificationPermissionRequested = false;

  constructor(private swPush: SwPush) {}

  /**
   * Request Notification permission from the user (called once per favorite)
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission was denied by user');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermissionRequested = true;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if a score change occurred for a game
   * Returns true if this is a new game or if scores changed
   */
  hasScoreChanged(gameId: string, homeScore: number, awayScore: number): boolean {
    const cached = this.lastKnownScores.get(gameId);

    if (!cached) {
      // New game, cache and consider it a "change"
      this.lastKnownScores.set(gameId, { home: homeScore, away: awayScore });
      return false; // Don't notify on initial load
    }

    const scoreChanged = cached.home !== homeScore || cached.away !== awayScore;

    if (scoreChanged) {
      this.lastKnownScores.set(gameId, { home: homeScore, away: awayScore });
    }

    return scoreChanged;
  }

  /**
   * Send a notification about a score change using Web Notifications API
   * Uses service worker for background delivery when available, falls back to standard Notification API
   */
  async notifyScoreChange(game: GameNotification): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.debug('Notification permission not granted, skipping notification');
      return;
    }

    const title = `${game.homeTeam} vs ${game.awayTeam}`;
    const options: NotificationOptions = {
      body: `${game.homeTeam} ${game.homeScore} - ${game.awayScore} ${game.awayTeam} | Period: ${game.currentPeriod} (${game.gameClock})`,
      icon: '/assets/icon-192x192.png',
      badge: '/assets/badge-72x72.png',
      tag: `game-${game.gameId}`, // Replaces previous notification for same game
      requireInteraction: false,
      data: {
        gameId: game.gameId,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam
      }
    };

    try {
      // Try to use service worker for background/persistent delivery first
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && 'showNotification' in registration) {
        console.debug('Showing notification via service worker');
        await registration.showNotification(title, options);
        return;
      }
    } catch (error) {
      console.error('Error showing notification via service worker:', error);
    }

    // Fallback to standard Notification API (works in foreground)
    try {
      console.debug('Showing notification via standard Notification API');
      new Notification(title, options);
    } catch (fallbackError) {
      console.error('Error showing notification:', fallbackError);
    }
  }

  /**
   * Cache a game's current score for future comparison
   * Useful for initial load or when resuming
   */
  cacheGameScore(gameId: string, homeScore: number, awayScore: number): void {
    this.lastKnownScores.set(gameId, { home: homeScore, away: awayScore });
  }

  /**
   * Clear cached scores for a specific game (e.g., when unfavoriting)
   */
  clearGameCache(gameId: string): void {
    this.lastKnownScores.delete(gameId);
  }

  /**
   * Clear all cached scores
   */
  clearAllCache(): void {
    this.lastKnownScores.clear();
  }

  /**
   * Get current cache size (for debugging)
   */
  getCacheSize(): number {
    return this.lastKnownScores.size;
  }
}
