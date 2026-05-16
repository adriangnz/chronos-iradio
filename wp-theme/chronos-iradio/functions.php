<?php
/**
 * Tema Chronos iRadio.
 *
 * Lo unico que hace WordPress aca es servir HTML. No hay loop, ni posts, ni
 * sidebars. La home la renderiza front-page.php. El resto del trabajo de este
 * archivo es:
 *
 *   1. Limpiar el ruido por defecto que mete wp_head() (generator, oEmbed,
 *      REST API links, emoji scripts, feeds, etc.) para que el HTML quede
 *      lo mas cercano posible al original estatico.
 *
 *   2. Exponer /sw.js, /manifest.json, /player.html y /humans.txt desde la
 *      raiz del dominio mediante rewrites. El service worker necesita scope
 *      "/" para controlar todo el sitio, asi que debe servirse desde la raiz
 *      con el header Service-Worker-Allowed. El manifest y sus paths internos
 *      tambien se reescriben a URLs absolutas del tema para que la instalacion
 *      PWA encuentre los iconos.
 *
 *   3. Flushear las reglas de rewrite cuando se activa el tema.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Helper: URL absoluta de un asset del tema con cache-busting por filemtime.
 * Cualquier cambio al archivo invalida automaticamente el cache de browser y
 * Cloudflare en el proximo deploy, sin renombrar manualmente.
 */
function chronos_asset_url( $relative ) {
    $theme_dir = get_template_directory();
    $theme_uri = trailingslashit( get_template_directory_uri() );
    $mtime     = @filemtime( $theme_dir . '/' . ltrim( $relative, '/' ) );
    return $theme_uri . ltrim( $relative, '/' ) . ( $mtime ? '?ver=' . $mtime : '' );
}

/* ---------------------------------------------------------------------------
 * 1. Theme setup
 * ------------------------------------------------------------------------ */
add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'style', 'script', 'navigation-widgets' ) );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'automatic-feed-links' ); // los hooks de feeds ya estan removidos abajo, esto solo afecta archives
} );

// Titulo de la home (cuando NO hay plugin SEO activo)
add_filter( 'pre_get_document_title', function ( $title ) {
    if ( chronos_iradio_seo_plugin_active() ) { return $title; }
    if ( is_front_page() ) {
        return 'Chronos iRadio - Radio Online en Vivo';
    }
    return $title;
} );

/* ---------------------------------------------------------------------------
 * 2. Limpiar wp_head() del ruido por defecto de WP
 * ------------------------------------------------------------------------ */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'rest_output_link_wp_head' );
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
remove_action( 'wp_head', 'wp_oembed_add_host_js' );
remove_action( 'wp_head', 'feed_links', 2 );
remove_action( 'wp_head', 'feed_links_extra', 3 );
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );

// Block scripts.com pingbacks header
add_filter( 'wp_headers', function ( $headers ) {
    unset( $headers['X-Pingback'] );
    return $headers;
} );

/* ---------------------------------------------------------------------------
 * 3. Rewrites para los archivos estaticos servidos desde la raiz
 *
 *    Permalinks debe estar configurado como "Post name" (o cualquier opcion
 *    distinta de "Plain") para que las rewrite rules funcionen. El README del
 *    tema lo explica en los pasos de instalacion.
 * ------------------------------------------------------------------------ */
add_action( 'init', function () {
    add_rewrite_rule( '^sw\.js$',        'index.php?chronos_static=sw',       'top' );
    add_rewrite_rule( '^manifest\.json$','index.php?chronos_static=manifest', 'top' );
    add_rewrite_rule( '^player\.html$',  'index.php?chronos_static=player',   'top' );
    add_rewrite_rule( '^humans\.txt$',   'index.php?chronos_static=humans',   'top' );
} );

// WP por defecto hace 301 a "/sw.js/" (trailing slash) via redirect_canonical
// antes de que nuestro template_redirect pueda servir el archivo. Lo
// desactivamos solo para las cuatro URLs que servimos desde el tema.
add_filter( 'redirect_canonical', function ( $redirect_url, $requested_url ) {
    $path = parse_url( $requested_url, PHP_URL_PATH );
    if ( in_array( $path, array( '/sw.js', '/manifest.json', '/player.html', '/humans.txt' ), true ) ) {
        return false;
    }
    return $redirect_url;
}, 10, 2 );

add_filter( 'query_vars', function ( $vars ) {
    $vars[] = 'chronos_static';
    return $vars;
} );

add_action( 'template_redirect', function () {
    $what = get_query_var( 'chronos_static' );
    if ( ! $what ) { return; }

    $theme_dir = get_template_directory();
    $theme_uri = trailingslashit( get_template_directory_uri() );
    $home      = trailingslashit( home_url( '/' ) );

    // Estos endpoints no son HTML y no quieren la 404 page de WP.
    status_header( 200 );
    nocache_headers();

    switch ( $what ) {

        case 'sw':
            // Service worker: scope "/" requiere este header explicito porque
            // el archivo vive bajo /wp-content/themes/.../sw.js.
            header( 'Content-Type: application/javascript; charset=utf-8' );
            header( 'Service-Worker-Allowed: /' );
            header( 'Cache-Control: no-cache, no-store, must-revalidate' );

            $sw = file_get_contents( $theme_dir . '/sw.js' );

            // El SHELL del sw.js incluye tanto './' como './index.html'. Tras
            // reescribir paths absolutos ambos terminan siendo home_url('/'),
            // lo que hace fallar a cache.addAll() por "duplicate requests".
            // Eliminamos la linea './index.html' del array antes del strtr.
            $sw = preg_replace( "#^\\s*'\\./index\\.html',\\s*\\n#m", '', $sw );

            // El sw.js original usa rutas tipo "./assets/...", "./styles.css",
            // etc. Como se sirve desde "/sw.js", esas relativas se resolverian
            // contra "/", que en WP no contiene los assets. Reescribimos a las
            // URLs absolutas correctas.
            $sw = strtr( $sw, array(
                "'./'"                                       => "'" . $home . "'",
                "'./player.html'"                            => "'" . $home . "player.html'",
                "'./styles.css'"                             => "'" . $theme_uri . "styles.css'",
                "'./app.js'"                                 => "'" . $theme_uri . "app.js'",
                "'./assets/logo/chronos-192.png'"            => "'" . $theme_uri . "assets/logo/chronos-192.png'",
                "'./assets/logo/chronos-512.png'"            => "'" . $theme_uri . "assets/logo/chronos-512.png'",
                "'./assets/logo/chronos-1024.png'"           => "'" . $theme_uri . "assets/logo/chronos-1024.png'",
                "'./assets/logo/chronos-maskable.png'"       => "'" . $theme_uri . "assets/logo/chronos-maskable.png'",
                "'./assets/logo/chronos-maskable-1024.png'"  => "'" . $theme_uri . "assets/logo/chronos-maskable-1024.png'",
                "'./assets/hero/banner-chronos.jpeg'"        => "'" . $theme_uri . "assets/hero/banner-chronos.jpeg'",
            ) );
            echo $sw;
            exit;

        case 'manifest':
            header( 'Content-Type: application/manifest+json; charset=utf-8' );
            header( 'Cache-Control: no-cache, no-store, must-revalidate' );

            $m = file_get_contents( $theme_dir . '/manifest.json' );
            $m = strtr( $m, array(
                '"/chronos-iradio/?app=player"' => '"' . $home . '?app=player"',
                '"./player.html"'               => '"' . $home . 'player.html"',
                '"./"'                          => '"' . $home . '"',
            ) );

            // Reescribe "assets/..." a URL absoluta + cache-bust por filemtime
            // para que un cambio del PNG fuerce a Android a regenerar el
            // WebAPK con el icono nuevo (sin esperar el ciclo de ~30 dias).
            $m = preg_replace_callback(
                '#"(assets/[^"]+)"#',
                function ( $matches ) use ( $theme_dir, $theme_uri ) {
                    $rel   = $matches[1];
                    $mtime = @filemtime( $theme_dir . '/' . $rel );
                    $bust  = $mtime ? '?v=' . $mtime : '';
                    return '"' . $theme_uri . $rel . $bust . '"';
                },
                $m
            );

            echo $m;
            exit;

        case 'humans':
            header( 'Content-Type: text/plain; charset=utf-8' );
            readfile( $theme_dir . '/humans.txt' );
            exit;

        case 'player':
            // No-cache fuerte para que Cloudflare/proxies/browsers no sirvan
            // versiones viejas tras un deploy del tema (los assets internos
            // siguen siendo cacheables, solo el HTML va sin cache).
            header( 'Cache-Control: no-cache, no-store, must-revalidate, max-age=0' );
            header( 'Pragma: no-cache' );
            include $theme_dir . '/templates/player.php';
            exit;
    }
} );

/* ---------------------------------------------------------------------------
 * 4. Flush rewrite rules on theme switch
 * ------------------------------------------------------------------------ */
add_action( 'after_switch_theme', function () {
    // Re-corre add_action('init', ...) para que add_rewrite_rule quede
    // registrada antes del flush.
    flush_rewrite_rules( false );
} );

/* ---------------------------------------------------------------------------
 * 5. Enqueue de styles y scripts
 *
 *    Reemplaza los <link rel="stylesheet"> y <script src=...> que antes
 *    estaban hardcodeados en front-page.php. Asi los plugins de cache pueden
 *    combinar/minificar, y el versionado lo maneja WP con la version del
 *    tema (cache-busting automatico al subir un ZIP nuevo).
 * ------------------------------------------------------------------------ */
add_action( 'wp_enqueue_scripts', function () {
    $theme_uri = trailingslashit( get_template_directory_uri() );
    $theme_dir = get_template_directory();

    // Versionado por filemtime: cada vez que el archivo cambia (deploy), el
    // ?ver= cambia y los browsers/Cloudflare lo re-piden automaticamente.
    $css_ver = (string) @filemtime( $theme_dir . '/styles.css' );
    $js_ver  = (string) @filemtime( $theme_dir . '/app.js' );

    // Google Fonts (los preconnect los maneja wp_resource_hints abajo).
    wp_enqueue_style(
        'chronos-iradio-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        array(),
        null
    );

    // CSS del sitio (depende de las fuentes para que carguen primero).
    wp_enqueue_style(
        'chronos-iradio-main',
        $theme_uri . 'styles.css',
        array( 'chronos-iradio-fonts' ),
        $css_ver
    );

    // JS del sitio en footer.
    wp_enqueue_script(
        'chronos-iradio-app',
        $theme_uri . 'app.js',
        array(),
        $js_ver,
        true
    );

    // Variable global que app.js usa para resolver assets desde el tema.
    wp_add_inline_script(
        'chronos-iradio-app',
        'window.CHRONOS_ASSET_BASE = ' . wp_json_encode( $theme_uri ) . ';',
        'before'
    );
} );

// Defer en app.js para no bloquear render.
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
    if ( 'chronos-iradio-app' === $handle && false === strpos( $tag, ' defer' ) ) {
        return str_replace( ' src=', ' defer src=', $tag );
    }
    return $tag;
}, 10, 2 );

/* ---------------------------------------------------------------------------
 * 6. Resource hints (preconnect, dns-prefetch) y preload critico
 * ------------------------------------------------------------------------ */
add_filter( 'wp_resource_hints', function ( $urls, $relation_type ) {
    if ( 'preconnect' === $relation_type ) {
        $urls[] = array( 'href' => 'https://fonts.googleapis.com' );
        $urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
    }
    if ( 'dns-prefetch' === $relation_type ) {
        $urls[] = 'https://onlineradiobox.com';
        $urls[] = 'https://cdn.onlineradiobox.com';
        $urls[] = 'https://ecdn.onlineradiobox.com';
    }
    return $urls;
}, 10, 2 );

// Preload del hero y logo solo en la home (LCP critico).
add_action( 'wp_head', function () {
    if ( ! is_front_page() ) { return; }
    $theme_uri = trailingslashit( get_template_directory_uri() );
    printf(
        '<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n",
        esc_url( chronos_asset_url( 'assets/hero/banner-chronos.jpeg' ) )
    );
    printf(
        '<link rel="preload" as="image" href="%s">' . "\n",
        esc_url( chronos_asset_url( 'assets/logo/chronos-512.png' ) )
    );
}, 2 );

/* ---------------------------------------------------------------------------
 * 7. SEO: meta tags + JSON-LD (suprimidos si hay plugin SEO activo)
 * ------------------------------------------------------------------------ */
function chronos_iradio_seo_plugin_active() {
    return defined( 'WPSEO_VERSION' )                      // Yoast SEO
        || defined( 'RANK_MATH_VERSION' )                  // Rank Math
        || class_exists( 'RankMath' )                      // Rank Math (alt)
        || function_exists( 'seopress_get_toggle_option' ) // SEOPress
        || defined( 'AIOSEO_VERSION' );                    // All in One SEO
}

add_action( 'wp_head', function () {
    if ( chronos_iradio_seo_plugin_active() ) { return; }
    if ( ! is_front_page() ) { return; }

    $theme_uri = trailingslashit( get_template_directory_uri() );
    $home      = trailingslashit( home_url( '/' ) );
    $og_image  = esc_url( $theme_uri . 'assets/og/og-banner-chronos.jpeg' );
    ?>
<meta name="description" content="Chronos iRadio - Los clasicos de la musica de todos los tiempos. Radio online desde Venezuela dedicada a revivir la herencia musical de los ultimos 50 anos. Rock, pop, soul, jazz y musica latina.">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Chronos iRadio">
<meta name="theme-color" content="#0a0a0f">
<meta name="geo.region" content="VE">
<meta name="geo.placename" content="Venezuela">
<meta name="geo.position" content="10.48801;-66.87919">
<meta name="ICBM" content="10.48801, -66.87919">
<link rel="canonical" href="<?php echo esc_url( $home ); ?>">
<meta property="og:type" content="website">
<meta property="og:title" content="Chronos iRadio - Radio Online en Vivo">
<meta property="og:description" content="Los clasicos de la musica de todos los tiempos. Radio online desde Venezuela con rock, pop, soul, jazz y musica latina de los ultimos 50 anos.">
<meta property="og:url" content="<?php echo esc_url( $home ); ?>">
<meta property="og:image" content="<?php echo $og_image; ?>">
<meta property="og:image:width" content="1080">
<meta property="og:image:height" content="359">
<meta property="og:image:alt" content="Chronos iRadio - Radio online desde Venezuela">
<meta property="og:site_name" content="Chronos iRadio">
<meta property="og:locale" content="es_VE">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Chronos iRadio - Radio Online en Vivo">
<meta name="twitter:description" content="Los clasicos de la musica de todos los tiempos. Radio online desde Venezuela con rock, pop, soul, jazz y musica latina de los ultimos 50 anos.">
<meta name="twitter:image" content="<?php echo $og_image; ?>">
<meta name="twitter:image:alt" content="Chronos iRadio - Radio online desde Venezuela">
<meta name="twitter:site" content="@chronos_iradio">
    <?php
}, 5 );

// Schema.org JSON-LD (solo home, suprimido si hay plugin SEO).
add_action( 'wp_head', function () {
    if ( ! is_front_page() ) { return; }
    if ( chronos_iradio_seo_plugin_active() ) { return; }

    $theme_uri = trailingslashit( get_template_directory_uri() );
    $home      = trailingslashit( home_url( '/' ) );

    $schema = array(
        '@context' => 'https://schema.org',
        '@graph'   => array(
            array(
                '@type'              => 'RadioStation',
                '@id'                => $home . '#radiostation',
                'name'               => 'Chronos iRadio',
                'url'                => $home,
                'logo'               => $theme_uri . 'assets/logo/chronos-192.jpg',
                'image'              => $theme_uri . 'assets/og/og-banner-chronos.jpeg',
                'description'        => 'Chronos iRadio es una estacion de radio dedicada a revivir y celebrar la rica herencia musical de los ultimos cincuenta anos. Desde los vibrantes ritmos del rock de los 70, pasando por las melodias del pop y el soul, hasta los inolvidables acordes del jazz y la musica latina.',
                'genre'              => array( 'Rock', 'Pop', 'Soul', 'Jazz', 'Latin' ),
                'broadcastFrequency' => 'Online',
                'broadcastTimezone'  => 'America/Caracas',
                'inLanguage'         => 'es',
                'areaServed'         => array( '@type' => 'Country', 'name' => 'Venezuela' ),
                'address'            => array( '@type' => 'PostalAddress', 'addressCountry' => 'VE' ),
                'sameAs'             => array(
                    'https://www.instagram.com/chronos_iradio',
                    'https://whatsapp.com/channel/0029Vb71Xvi05MUjSz673L1W',
                    'http://t.me/Km_rodriguez',
                ),
                'founder'            => array( '@type' => 'Person', 'name' => 'Km Rodriguez', 'jobTitle' => 'Creador y Director' ),
                'employee'           => array(
                    array( '@type' => 'Person', 'name' => 'Eryx Rodriguez',     'jobTitle' => 'Produccion y Locutor' ),
                    array( '@type' => 'Person', 'name' => 'Enrique Gonzalez',   'jobTitle' => 'Voz e Imagen' ),
                    array( '@type' => 'Person', 'name' => 'Franmary Fernandez', 'jobTitle' => 'Locutora' ),
                    array( '@type' => 'Person', 'name' => 'Victor Grinfelds',   'jobTitle' => 'Ingeniero' ),
                ),
            ),
            array(
                '@type'      => 'WebSite',
                '@id'        => $home . '#website',
                'url'        => $home,
                'name'       => 'Chronos iRadio',
                'publisher'  => array( '@id' => $home . '#radiostation' ),
                'inLanguage' => 'es',
            ),
        ),
    );

    echo '<script type="application/ld+json">'
        . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
        . '</script>' . "\n";
}, 6 );

/* ---------------------------------------------------------------------------
 * 8. Misc: admin bar, admin notice, robots.txt
 * ------------------------------------------------------------------------ */
// Ocultar admin bar en el front-end (el sitio es una landing, no necesita
// que el admin se le superponga al hero). En /wp-admin sigue apareciendo.
add_filter( 'show_admin_bar', '__return_false' );

// Aviso si permalinks estan en Plain (rompe /sw.js, /manifest.json, /player.html).
add_action( 'admin_notices', function () {
    if ( '' === get_option( 'permalink_structure' ) ) {
        printf(
            '<div class="notice notice-error"><p><strong>%s</strong> %s <a href="%s">%s</a>.</p></div>',
            'Chronos iRadio:',
            'La estructura de enlaces permanentes esta en "Sencillo". El tema necesita cualquier otra opcion (recomendado: "Nombre de la entrada") para que /sw.js, /manifest.json y /player.html funcionen.',
            esc_url( admin_url( 'options-permalink.php' ) ),
            'Configurar ahora'
        );
    }
} );

// robots.txt: bloquear bots de entrenamiento IA. La linea Sitemap NO se
// agrega aca — la inyectan los plugins SEO (Rank Math, Yoast, etc.) y
// emitir otra desde el tema generaria duplicado apuntando a /sitemap.xml
// (URL que ni Rank Math ni un sitio sin plugin sirven).
add_filter( 'robots_txt', function ( $output, $public ) {
    if ( ! $public ) { return $output; }
    $extras = "\n# Bloquear bots de entrenamiento de IA\n";
    foreach ( array( 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'anthropic-ai', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'cohere-ai', 'Bytespider', 'CCBot', 'Diffbot', 'FacebookBot', 'Applebot-Extended' ) as $bot ) {
        $extras .= "User-agent: {$bot}\nDisallow: /\n\n";
    }
    return $output . $extras;
}, 10, 2 );
