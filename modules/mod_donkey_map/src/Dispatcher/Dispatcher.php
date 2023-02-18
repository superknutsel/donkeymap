<?php
/**
 * @package         Joomla.Site
 * @subpackage      mod_donkey_map
 *
 * @copyright   (C) 2023 Obix webtechniek <https://www.obix.nl>
 * @license         GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\DonkeyMap\Site\Dispatcher;

use Joomla\CMS\Dispatcher\AbstractModuleDispatcher;
use Joomla\CMS\Helper\HelperFactoryAwareInterface;
use Joomla\CMS\Helper\HelperFactoryAwareTrait;
use Joomla\CMS\Uri\Uri;

// phpcs:disable PSR1.Files.SideEffects
\defined('JPATH_PLATFORM') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Dispatcher class for mod_donkey_map
 *
 * @since  4.2.0
 */
class Dispatcher extends AbstractModuleDispatcher implements HelperFactoryAwareInterface
{
    use HelperFactoryAwareTrait;

    /**
     * Returns the layout data.
     *
     * @return  array
     *
     * @since   4.2.0
     */
    protected function getLayoutData()
    {
        $data = parent::getLayoutData();

        $mapCenterParam = $data['params']->get('map_center');
        $polygonParam = json_decode($data['params']->get('polygon'));

        $mapConfig = (object)[
            'center'      => (object)[
                'lat'  => (float)$mapCenterParam->lat,
                'long' => (float)$mapCenterParam->long,
            ],
            'initialZoom' => (float)$data['params']->get('initial_zoom'),
            'polygon' => $polygonParam->geometries[0]->coordinates[0][0]
        ];

        // Convert category/marker associations to a manageable array.
        $categoryMarkers = array_values((array)$data['params']->get('category_markers'));

        $iconSizeParam        = $data['params']->get('icon_size');
        $iconAnchorParam      = $data['params']->get('icon_anchor');
        $iconPopupAnchorParam = $data['params']->get('icon_popup_anchor');

        $markerConfig = [
            'defaultIcon'   => Uri::root() . '/' . $data['params']->get('default_marker_icon'),
            // Create an array containing category id/icon combination objects.
            'categoryIcons' => array_map(
                fn(object $o) => (object)['catId' => (int)$o->catid[0], 'icon' => Uri::root() . '/' . $o->icon],
                $categoryMarkers
            ),
            'iconConfig'    => (object)[
                'size'        => (object)[
                    'width'  => (int)$iconSizeParam->width,
                    'height' => (int)$iconSizeParam->height,
                ],
                'anchor'      => (object)[
                    'top'  => (int)$iconAnchorParam->top,
                    'left' => (int)$iconAnchorParam->left,
                ],
                'popupAnchor' => (object)[
                    'top'  => (int)$iconPopupAnchorParam->top,
                    'left' => (int)$iconPopupAnchorParam->left,
                ],
            ],
            'clusteringEnabled' => (int) $data['params']->get('clustering_enabled', 0) ? true : false
        ];

        $data['mapConfig']    = $mapConfig;
        $data['markerConfig'] = $markerConfig;

        $helper = $this->getHelperFactory()->getHelper('DonkeyMapHelper');

        $data['markerList'] = $helper->getMarkers(
            $data['params'],
            $this->getApplication()
        );

        $data['list'] = $helper->getArticles(
            $data['params'],
            $this->getApplication()
        );

        return $data;
    }
}
