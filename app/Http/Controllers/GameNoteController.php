<?php

namespace App\Http\Controllers;

use App\Models\GameNote;
use Illuminate\Http\Request;

class GameNoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|integer',
            'note' => 'required|string'
        ]);

        $note = auth()->user()->notes()->updateOrCreate(
            ['game_id' => $validated['game_id']],
            ['note' => $validated['note']]
        );

        return back();
    }

    public function destroy($gameId)
    {
        auth()->user()
            ->notes()
            ->where('game_id', $gameId)
            ->delete();

        return back();
    }
}