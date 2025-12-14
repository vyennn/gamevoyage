<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'game_id',
        'game_title',
        'game_thumbnail',
        'game_genre'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}