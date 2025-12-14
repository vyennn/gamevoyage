<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Add game to favorites
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|integer',
            'game_title' => 'required|string|max:255',
            'game_thumbnail' => 'required|url',
            'game_genre' => 'required|string|max:100'
        ]);

        $favorite = auth()->user()->favorites()->create($validated);

        return response()->json([
            'success' => true,
            'favorite' => $favorite
        ]);
    }

    /**
     * Remove game from favorites
     */
    public function destroy($gameId)
    {
        auth()->user()
            ->favorites()
            ->where('game_id', $gameId)
            ->delete();

        return response()->json([
            'success' => true
        ]);
    }

    /**
     * Get all user favorites
     */
    public function index()
    {
        $favorites = auth()->user()
            ->favorites()
            ->latest()
            ->get();

        return response()->json($favorites);
    }
}