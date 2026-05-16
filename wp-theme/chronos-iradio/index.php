<?php
/**
 * Fallback global.
 *
 * WordPress requiere que todo tema tenga un index.php. En la practica la home
 * la renderiza front-page.php; cualquier otra URL (paginas, 404, etc.)
 * tambien cae aca y se trata como la home — este sitio es single-page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_template_part( 'front-page' );
