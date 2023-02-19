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

        $data['mapConfig']    = $this->getMapConfig($data);
        $data['markerConfig'] = $this->getMarkerConfig($data);
        $data['markerList']   = $this->getMarkerList($data);

        return $data;
    }

    private function getMapConfig(array $data): object
    {
        $mapCenterParam = $data['params']->get('map_center');

        return (object)[
            'center'             => (object)[
                'lat'  => (float)$mapCenterParam->lat,
                'long' => (float)$mapCenterParam->long,
            ],
            'initialZoom'        => (float)$data['params']->get('initial_zoom'),
            'polygonCoordinates' => $this->getPolygonCoordinates($data),
            'polygonAttributes'  => $this->getPolygonAttributes($data),
        ];
    }

    private function getPolygonCoordinates(array $data): array
    {
        $param = $data['params']->get('polygon');

        if ($param === '-1') {
            return [];
        }

        $polygonFile   = JPATH_ROOT . '/media/mod_donkey_map/polygons/' . $param;
        $polygonJson   = file_get_contents($polygonFile);
        $polygonObject = json_decode($polygonJson);

        // latituede & longitude are in the wrong odrer for Leaflet, so let's fix that.
        $coordinates = [];

        foreach ($polygonObject->geometries[0]->coordinates[0][0] as $point) {
            $coordinates[] = [$point[1], $point[0]];
        }

        return $coordinates;
    }

    private function getPolygonAttributes(array $data): object
    {
        $param = $data['params']->get('polygon_attributes');

        return (object) [
            'color' => $param->color,
            'opacity' => $param->opacity,
            'weight' => $param->weight,
            'fillColor' => $param->fill_color,
            'fillOpacity' => $param->fill_opacity
        ];
    }

    private function getMarkerConfig(array $data): object
    {
        // Convert category/marker associations to an array containing icon file paths indexed by category id.
        $categoryMarkerIcons = array_values((array)$data['params']->get('categories', []));
        $iconsByCatId        = array_reduce($categoryMarkerIcons, function (array $carry, object $marker) {
            $carry[(int)$marker->categoryId[0]] = $marker->icon ? Uri::root() . $marker->icon : '';

            return $carry;
        }, []);

        $iconSizeParam        = $data['params']->get('icon_size');
        $iconAnchorParam      = $data['params']->get('icon_anchor');
        $iconPopupAnchorParam = $data['params']->get('icon_popup_anchor');

        if ($defaultIcon = $data['params']->get('default_marker_icon', '')) {
            $defaultIcon = Uri::root() . $defaultIcon;
        }

        return (object)[
            'defaultIcon'       => $defaultIcon,
            // Create an array containing category id/icon combination objects.
            'categoryIcons'     => $iconsByCatId,
            'iconConfig'        => (object)[
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
            'clusteringEnabled' => (int)$data['params']->get('clustering_enabled', 0) ? true : false,
        ];
    }

    private function getMarkerList(array $data): array
    {
        $helper = $this->getHelperFactory()->getHelper('DonkeyMapHelper');

        return $helper->getMarkers(
            $data['params'],
            $this->getApplication()
        );
    }
}
