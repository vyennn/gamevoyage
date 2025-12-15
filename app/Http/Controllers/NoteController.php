<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;

class NoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|integer',
            'note' => 'required|string'
        ]);

        Note::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'game_id' => $validated['game_id']
            ],
            ['note' => $validated['note']]
        );

        return response()->json(['success' => true]);
    }

    public function destroy($gameId)
    {
        Note::where('user_id', auth()->id())
            ->where('game_id', $gameId)
            ->delete();

        return response()->json(['success' => true]);
    }
}