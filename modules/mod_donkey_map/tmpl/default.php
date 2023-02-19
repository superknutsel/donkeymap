<?php
/**
 * @package     Joomla.Site
 * @subpackage  mod_articles_latest
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

// https://docs.joomla.org/J3.x:Adding_JavaScript_and_CSS_to_the_page
use Joomla\CMS\Factory;
use \Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\CMS\Uri\Uri;

$document = Factory::getApplication()->getDocument();

/** @var object $module */
/** @var object $mapConfig */
/** @var object $markerConfig */
$containerId = 'donkey-map-' . $module->id;

/** @var Joomla\CMS\WebAsset\WebAssetManager $wam */
$wam = Factory::getApplication()->getDocument()->getWebAssetManager();
$wam->registerAndUseStyle(
    'donkey_map_site.css',
    'mod_donkey_map/donkey_map_site.min.css',
);
$wam->registerAndUseScript(
    'donkey_map_site.js',
    'mod_donkey_map/donkey_map_site.min.js',
    []
);
?>

<div id="<?= $containerId ?>" style="width: 100%; height: 350px;"></div>

<script>
    document.addEventListener('DOMContentLoaded', e => {
        const map = Obix.DonkeyMapHelper.createDonkeyMap(
            <?= json_encode($mapConfig) ?>,
            <?= json_encode($markerConfig) ?>,
            <?= json_encode($markerList) ?>
        );

        map.attach('<?= $containerId ?>');
    });
</script>