<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\GameNoteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Main game listing page
Route::get('/', [GameController::class, 'index'])->name('home');

// Protected routes (require authentication)
Route::middleware('auth')->group(function () {
    // Favorites
    Route::post('/favorites', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{gameId}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');
    Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    
    // Notes
    Route::post('/notes', [GameNoteController::class, 'store'])->name('notes.store');
    Route::delete('/notes/{gameId}', [GameNoteController::class, 'destroy'])->name('notes.destroy');
    
    // Profile routes (from Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//require __DIR__.'/auth.php';