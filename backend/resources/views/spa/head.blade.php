{{-- Rendered into the <!--app:head--> slot of the built index.html. data-rh tags are replaced by react-helmet-async. --}}
    <title>{{ $meta['title'] }}</title>
    <meta name="description" data-rh="true" content="{{ $meta['description'] }}" />
    <link rel="canonical" data-rh="true" href="{{ $url }}" />
    <meta name="theme-color" data-rh="true" content="{{ $site['themeColor'] }}" />
@if ($meta['noindex'])
    <meta name="robots" data-rh="true" content="noindex, nofollow" />
@endif
    <meta property="og:type" data-rh="true" content="{{ $meta['type'] }}" />
    <meta property="og:site_name" data-rh="true" content="{{ $site['brandName'] }}" />
    <meta property="og:title" data-rh="true" content="{{ $meta['title'] }}" />
    <meta property="og:description" data-rh="true" content="{{ $meta['description'] }}" />
    <meta property="og:url" data-rh="true" content="{{ $url }}" />
    <meta property="og:image" data-rh="true" content="{{ $image }}" />
    <meta property="og:image:width" data-rh="true" content="1200" />
    <meta property="og:image:height" data-rh="true" content="630" />
    <meta name="twitter:card" data-rh="true" content="summary_large_image" />
    <meta name="twitter:title" data-rh="true" content="{{ $meta['title'] }}" />
    <meta name="twitter:description" data-rh="true" content="{{ $meta['description'] }}" />
    <meta name="twitter:image" data-rh="true" content="{{ $image }}" />
    <script type="application/ld+json">{!! \App\Http\Controllers\SpaController::json($organization) !!}</script>
@if ($meta['jsonLd'])
    <script type="application/ld+json" data-rh="true">{!! \App\Http\Controllers\SpaController::json(count($meta['jsonLd']) === 1 ? $meta['jsonLd'][0] : $meta['jsonLd']) !!}</script>
@endif
