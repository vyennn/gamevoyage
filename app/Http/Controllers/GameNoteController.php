<?php

namespace App\Http\Controllers;

use App\Models\GameNote;
use Illuminate\Http\Request;

class GameNoteController extends Controller
{
    /**
     * Create or update a note
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|integer',
            'note' => 'required|string|max:1000'
        ]);

        $note = auth()->user()->gameNotes()->updateOrCreate(
            ['game_id' => $validated['game_id']],
            ['note' => $validated['note']]
        );

        return response()->json([
            'success' => true,
            'note' => $note
        ]);
    }

    /**
     * Delete a note
     */
    public function destroy($gameId)
    {
        auth()->user()
            ->gameNotes()
            ->where('game_id', $gameId)
            ->delete();

        return response()->json([
            'success' => true
        ]);
    }
}