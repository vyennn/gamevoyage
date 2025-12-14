<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FreeToGameService
{
    /**
     * Get all games with caching
     */
    public function getGames()
    {
        return Cache::remember('freetogame_all', 3600, function () {
            try {
                $response = Http::timeout(10)->get('https://www.freetogame.com/api/games');
                
                if ($response->successful()) {
                    return $response->json();
                }
                
                return [];
            } catch (\Exception $e) {
                \Log::error('FreeToGame API Error: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get single game by ID
     */
    public function getGameById($id)
    {
        return Cache::remember("freetogame_{$id}", 3600, function () use ($id) {
            try {
                $response = Http::timeout(10)->get("https://www.freetogame.com/api/game?id={$id}");
                
                if ($response->successful()) {
                    return $response->json();
                }
                
                return null;
            } catch (\Exception $e) {
                \Log::error("FreeToGame API Error for game {$id}: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Clear cache (useful for testing)
     */
    public function clearCache()
    {
        Cache::forget('freetogame_all');
    }
}