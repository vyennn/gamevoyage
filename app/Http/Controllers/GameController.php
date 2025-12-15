<?php

namespace App\Http\Controllers;

use App\Services\FreeToGameService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    protected $gameService;

    public function __construct(FreeToGameService $gameService)
    {
        $this->gameService = $gameService;
    }

    public function index()
    {
        $games = $this->gameService->getGames();
        
        $userFavorites = [];
        $userNotes = [];
        
        if (auth()->check()) {
            $userFavorites = auth()->user()
                ->favorites()
                ->pluck('game_id')
                ->toArray();
                
            $userNotes = auth()->user()
                ->notes()  // Fixed!
                ->pluck('note', 'game_id')
                ->toArray();
        }

        return Inertia::render('Games/Index', [  // Fixed!
            'games' => $games,
            'userFavorites' => $userFavorites,
            'userNotes' => $userNotes,  // Fixed!
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }
}