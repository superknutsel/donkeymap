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

$document = Factory::getApplication()->getDocument();

/** @var object $module */
/** @var object $mapConfig */
/** @var object $markerConfig */
/** @var array $markerList */

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

$containerId = 'donkey-map-' . $module->id;

$containerStyles = [];

if ($value = trim($mapConfig->container->width)) {
    $containerStyles[] = 'width:' . $value;
}
if ($value = trim($mapConfig->container->height)) {
    $containerStyles[] = 'height:' . $value;
}
$containerStyleAttribute = count($containerStyles) ? 'style="' . implode(';', $containerStyles) . '"' : '';
?>

<div id="<?= $containerId ?>" <?= $containerStyleAttribute ?>></div>

<script>
    document.addEventListener('DOMContentLoaded', e => {
        const map = Obix.DonkeyMapHelper.createDonkeyMap(
            <?= json_encode($mapConfig) ?>,
            <?= json_encode($markerConfig) ?>,
            <?= json_encode($markerList) ?>
        );

        map.addCustomHandlers({
            'marker': {
                'popupopen': () => {
                    if (RegularLabs !== undefined && RegularLabs.TabsAccordions !== undefined) {
                        RegularLabs.TabsAccordions.init(null);
                    }
                }
            }
        });

        map.attach('<?= $containerId ?>');
    });
</script>