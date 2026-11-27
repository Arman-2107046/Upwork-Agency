<?php

use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);

// Every other GET is a page of the React site (the admin registers its own /admin routes).
Route::get('/', SpaController::class);
Route::fallback(SpaController::class);
